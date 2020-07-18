import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import { compose } from '../../client/base/compose'

import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../../shared/time/clock'
import { NodeSystemClock } from '../time/node_clock'

import { DirectNUClearNetClient } from './direct_nuclearnet_client'
import { FakeNUClearNetClient } from './fake_nuclearnet_client'
import { LruPriorityQueue } from './lru_priority_queue'
import { WebSocketServer } from './web_socket_server'
import { WebSocket } from './web_socket_server'

type Opts = {
  fakeNetworking: boolean
  connectionOpts: NUClearNetOptions
}

/**
 * The server component of a NUClearNet proxy running over web sockets. Acts as a gateway to the NUClear network.
 * All clients currently share a single NUClearNet connection, mostly for performance reasons. Could potentially be
 * improved to have more intelligent multiplexing.
 */
export class WebSocketProxyNUClearNetServer {
  private readonly peers = new Set<NUClearNetPeer>()
  private readonly clients = new Set<WebSocketServerClient>()
  private disconnect?: () => void

  constructor(
    private readonly server: WebSocketServer,
    private readonly nuclearnetClient: NUClearNetClient,
    private readonly connectionOpts: NUClearNetOptions,
  ) {
    server.onConnection(this.onClientConnection)
  }

  static of(
    server: WebSocketServer,
    { fakeNetworking, connectionOpts }: Opts,
  ): WebSocketProxyNUClearNetServer {
    const nuclearnetClient: NUClearNetClient = fakeNetworking
      ? FakeNUClearNetClient.of()
      : DirectNUClearNetClient.of()
    return new WebSocketProxyNUClearNetServer(server, nuclearnetClient, connectionOpts)
  }

  private onClientConnection = (socket: WebSocket) => {
    const client = WebSocketServerClient.of(this.nuclearnetClient, socket)
    this.clients.add(client)
    socket.on('nuclear_connect', (opts: NUClearNetOptions) => {
      if (!this.disconnect && this.clients.size === 1) {
        // First client, connect to NUClearNet.
        this.disconnect = compose([
          this.nuclearnetClient.onJoin(this.onJoin),
          this.nuclearnetClient.onLeave(this.onLeave),
          this.nuclearnetClient.connect({
            ...opts,
            ...this.connectionOpts,
          }),
        ])
      } else {
        // Already connected, send fake join packets for everyone already on the network.
        for (const peer of this.peers) {
          socket.send('nuclear_join', peer)
        }
      }
    })
    const stopProcessing = client.startProcessing()
    socket.onDisconnect(() => {
      stopProcessing()
      this.clients.delete(client)
      if (this.clients.size === 0) {
        // Last client, disconnect from NUClearNet.
        this.disconnect?.()
        this.disconnect = undefined
      }
    })
  }

  private onJoin = (peer: NUClearNetPeer) => {
    this.peers.add(this.getCanonicalPeer(peer))
  }

  private onLeave = (leavingPeer: NUClearNetPeer) => {
    this.peers.delete(this.getCanonicalPeer(leavingPeer))
  }

  /**
   * NUClearNet peer objects do not maintain referential identity, this normalizes them so that they do.
   * This allows them to be used within contexts that require triple equal (===) object equality (e.g. sets).
   */
  private getCanonicalPeer(peer: NUClearNetPeer): NUClearNetPeer {
    const existingPeer = Array.from(this.peers.values()).find(
      otherPeer =>
        otherPeer.name === peer.name &&
        otherPeer.address === peer.address &&
        otherPeer.port === peer.port,
    )
    return existingPeer ?? peer
  }
}

class WebSocketServerClient {
  private readonly offListenMap = new Map<string, () => void>()

  constructor(
    private nuclearnetClient: NUClearNetClient,
    private socket: WebSocket,
    private processor: PacketProcessor,
  ) {
    this.offListenMap = new Map()
  }

  static of(nuclearnetClient: NUClearNetClient, socket: WebSocket) {
    return new WebSocketServerClient(nuclearnetClient, socket, PacketProcessor.of(socket))
  }

  startProcessing(): () => void {
    return compose([
      this.nuclearnetClient.onJoin(this.onJoin),
      this.nuclearnetClient.onLeave(this.onLeave),
      this.socket.on('packet', this.onClientPacket),
      this.socket.on('listen', this.onListen),
      this.socket.on('unlisten', this.onUnlisten),
      () => {
        this.offListenMap.forEach(off => off())
        this.offListenMap.clear()
      },
    ])
  }

  private onJoin = (peer: NUClearNetPeer) => {
    this.socket.send('nuclear_join', peer)
  }

  private onLeave = (peer: NUClearNetPeer) => {
    this.socket.send('nuclear_leave', peer)
  }

  private onListen = (event: string, requestToken: string) => {
    const off = this.nuclearnetClient.on(event, this.onServerPacket.bind(this, event))
    this.offListenMap.set(requestToken, off)
  }

  private onUnlisten = (requestToken: string) => {
    this.offListenMap.get(requestToken)?.()
  }

  private onServerPacket = (event: string, packet: NUClearNetPacket) => {
    this.processor.onPacket(event, packet)
  }

  private onClientPacket = (options: NUClearNetSend) => {
    this.nuclearnetClient.send(options)
  }
}

type NetStats = {
  // The total number of packets that are out on the wire.
  active: number
  processingTime: number
  // The total number of payload bytes sent to the client over the lifetime of the connection.
  bytesSent: number
  // The total number of payload bytes acknowledged from the client over the lifetime of the connection.
  bytesAcked: number
  // The timestamp of when the last packet was sent.
  lastSent: number
}

class PacketProcessor {
  private readonly netstatsByEvent = new Map<string, NetStats>()
  private readonly stats: NetStats = {
    active: 0,
    bytesSent: 0,
    bytesAcked: 0,
    processingTime: 0.1,
    lastSent: 0,
  }

  // The number of seconds before giving up on an acknowledge
  private readonly timeout: number

  constructor(
    private socket: WebSocket,
    private clock: Clock,
    private queue: LruPriorityQueue<string, { event: string; packet: NUClearNetPacket }>,
    { timeout }: { timeout: number },
  ) {
    this.timeout = timeout
    this.queue = queue
  }

  static of(socket: WebSocket) {
    return new PacketProcessor(
      socket,
      NodeSystemClock,
      new LruPriorityQueue({ capacityPerKey: 2 }),
      { timeout: 5 },
    )
  }

  onPacket(event: string, packet: NUClearNetPacket) {
    if (packet.reliable) {
      // Always send reliable packets
      this.socket.send(event, packet)
    } else {
      // Throttle unreliable packets so that we do not overwhelm the client with traffic.
      const key = `${event}:${packet.peer.name}:${packet.peer.address}:${packet.peer.port}`
      this.queue.add(key, { event, packet })
      this.maybeSendNextPacket()
    }
  }

  private maybeSendNextPacket() {
    const next = this.queue.pop()
    if (next) {
      if (this.canSendEvent()) {
        const { event, packet } = next
        let isDone = false
        this.stats.active++
        this.stats.bytesSent += packet.payload.length
        const done = (processingTime?: number) => {
          if (!isDone) {
            // Update our performance tracking information
            this.stats.active -= 1
            this.stats.bytesAcked += packet.payload.length
            if (processingTime != null) {
              // https://en.wikipedia.org/wiki/Exponential_smoothing
              const n = 10
              this.stats.processingTime = (this.stats.processingTime * n + processingTime) / (n + 1)
            }
            isDone = true
            this.maybeSendNextPacket()
          }
        }
        this.socket.send(event, packet, done)
        this.stats.lastSent = this.clock.performanceNow()
        this.clock.setTimeout(done, this.timeout)
      }
    }
  }

  private canSendEvent(): boolean {
    const bytesBehind = this.stats.bytesSent - this.stats.bytesAcked
    const bytesLow = 1024 * 1024
    const bytesHigh = 1024 * 1024 * 10
    const aheadRatio = lerp(bytesBehind, bytesLow, bytesHigh)
    return aheadRatio < Math.random()
  }
}

function lerp(x: number, min: number, max: number): number {
  return clamp((x - min) / (max - min), 0, 1)
}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max)
}
