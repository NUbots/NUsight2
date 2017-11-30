import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { DirectNUClearNetClient } from './direct_nuclearnet_client'
import { FakeNUClearNetClient } from './fake_nuclearnet_client'
import { WebSocketServer } from './web_socket_server'
import { WebSocket } from './web_socket_server'
import { NodeSystemClock } from '../time/node_clock'
import { Clock } from '../../shared/time/clock'

type Opts = {
  fakeNetworking: boolean
}

/**
 * The server component of a NUClearNet proxy running over web sockets. Acts as a gateway to the NUClear network.
 * All clients currently share a single NUClearNet connection, mostly for performance reasons. Could potentially be
 * improved to have more intelligent multiplexing.
 */
export class WebSocketProxyNUClearNetServer {
  public constructor(private server: WebSocketServer, private nuclearnetClient: NUClearNetClient) {
    server.onConnection(this.onClientConnection)
  }

  public static of(server: WebSocketServer, { fakeNetworking }: Opts): WebSocketProxyNUClearNetServer {
    const nuclearnetClient: NUClearNetClient = fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
    return new WebSocketProxyNUClearNetServer(server, nuclearnetClient)
  }

  private onClientConnection = (socket: WebSocket) => {
    WebSocketServerClient.of(this.nuclearnetClient, socket)
  }
}

class WebSocketServerClient {
  private connected: boolean
  private offJoin: () => void
  private offLeave: () => void
  private offListenMap: Map<string, () => void>
  private processors: Map<NUClearNetPeer, PacketProcessor>

  public constructor(private nuclearnetClient: NUClearNetClient, private socket: WebSocket) {
    this.connected = false
    this.offJoin = this.nuclearnetClient.onJoin(this.onJoin)
    this.offLeave = this.nuclearnetClient.onLeave(this.onLeave)
    this.offListenMap = new Map()
    this.processors = new Map()

    this.socket.on('listen', this.onListen)
    this.socket.on('unlisten', this.onUnlisten)
    this.socket.on('nuclear_connect', this.onConnect)
    this.socket.on('disconnect', this.onDisconnect)
  }

  public static of(nuclearNetClient: NUClearNetClient, socket: WebSocket) {
    return new WebSocketServerClient(nuclearNetClient, socket)
  }

  private onJoin = (peer: NUClearNetPeer) => {
    this.socket.send('nuclear_join', peer)
    this.processors.set(peer, PacketProcessor.of(this.socket))
  }

  private onLeave = (peer: NUClearNetPeer) => {
    this.socket.send('nuclear_leave', peer)
    const peerKey = this.getPeer(this.processors.keys(), peer)
    if (peerKey) {
      this.processors.delete(peerKey)
    }
  }

  private onConnect = (options: NUClearNetOptions) => {
    // This could be improved.
    // Currently only listens to the first connection request and ignores subsequent requests.
    // Smarter multiplexing of the shared connection would be ideal.
    if (!this.connected) {
      const disconnect = this.nuclearnetClient.connect(options)
      this.connected = true
      this.socket.on('nuclear_disconnect', () => {
        disconnect()
        this.connected = false
      })
    }
  }

  private onListen = (event: string, requestToken: string) => {
    const off = this.nuclearnetClient.on(event, this.onPacket.bind(this, event))
    this.offListenMap.set(requestToken, off)
  }

  private onUnlisten = (requestToken: string) => {
    const off = this.offListenMap.get(requestToken)
    if (off) {
      off()
    }
  }

  private onDisconnect = () => {
    this.offJoin()
    this.offLeave()
  }

  private onPacket = (event: string, packet: NUClearNetPacket) => {
    const peerKey = this.getPeer(this.processors.keys(), packet.peer)
    if (peerKey) {
      const processor = this.processors.get(peerKey)
      if (processor) {
        processor.onPacket(event, packet)
      }
    }
  }

  /**
   * Look for the needle 'peer' inside the haystack 'peers'. They might not be the same object reference.
   */
  private getPeer(peers: Iterable<NUClearNetPeer>, peer: NUClearNetPeer): NUClearNetPeer | undefined {
    return Array.from(peers).find(otherPeer => {
      return otherPeer.name === peer.name && otherPeer.address === peer.address && otherPeer.port === peer.port
    })
  }
}

class PacketProcessor {

  // For each event holds the current latency and execution time
  private eventTracking: Map<string, {active: number, latency: number, processing: number}>

  // The number of seconds before giving up on an acknowledge
  private timeout: number

  constructor(private socket: WebSocket,
              private clock: Clock,
              opts: { timeout: number }) {
    this.timeout = opts.timeout
    this.eventTracking = new Map()
  }

  public static of(socket: WebSocket) {
    return new PacketProcessor(socket, NodeSystemClock, { timeout: 5 })
  }

  public onPacket(event: string, packet: NUClearNetPacket) {
    if (packet.reliable) {
      this.sendReliablePacket(event, packet)
    } else if (this.isEventBelowLimit(event)) {
      this.sendUnreliablePacket(event, packet)
    }/* else {
      // This event is unreliable and already at the limit, simply drop the packet.
    }*/
  }

  private isEventBelowLimit(event: string) {
    const et = this.eventTracking.get(event) || { active: 0, latency: 1.0, processing: 0.5 }
    return et.active < (et.processing / et.latency)
  }

  private sendReliablePacket(event: string, packet: NUClearNetPacket) {
    // Always send reliable packets
    this.socket.send(event, packet)
  }

  private sendUnreliablePacket(event: string, packet: NUClearNetPacket) {
    // Throttle unreliable packets so that we do not overwhelm the client with traffic.
    const done = this.enqueue(event, this.clock.performanceNow())
    this.socket.send(event, packet, done)
    this.clock.setTimeout(done.bind(this.clock.performanceNow() + this.timeout), this.timeout)
  }

  private enqueue(event: string, start: number): (time: number) => void {
    let isDone = false
    const tracking = this.eventTracking.get(event) || { active: 0, latency: 1.0, processing: 0.5 }
    tracking.active += 1
    this.eventTracking.set(event, tracking)

    return (processing: number) => {
      if (!isDone) {
        // Calculate network latency
        const latency = this.clock.performanceNow() - start

        // Update our performance tracking information
        const tracking = this.eventTracking.get(event) || { active: 0, latency: 1.0, processing: 0.5 }
        tracking.active -= 1
        tracking.latency = (tracking.latency * 10 + latency) / 11
        tracking.processing = (tracking.processing * 10 + processing) / 11

        this.eventTracking.set(event, tracking)
        isDone = true
      }
    }
  }
}
