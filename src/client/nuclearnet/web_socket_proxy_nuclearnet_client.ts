import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../../shared/time/clock'
import { BrowserSystemClock } from '../time/browser_clock'

import { WebWorkerWebSocketClient } from './webworker_web_socket_client'
import { WebSocketClient } from './web_socket_client'

type PacketListener = (packet: NUClearNetPacket, ack?: () => void) => void

/**
 * A client-side interface for interacting with NUClearNet. Allows a browser to connect transparently connect to
 * NUClearNet, using web sockets at the transport layer. Supports automatic reconnection, which rebinds all NUClearNet
 * event listeners.
 */
export class WebSocketProxyNUClearNetClient implements NUClearNetClient {
  private nextRequestToken: number

  // Store all listeners so that we can restore them after a socket disconnection/reconnection.
  private joinListeners: Set<NUClearEventListener>
  private leaveListeners: Set<NUClearEventListener>
  private packetListeners: Map<string, Set<{ requestToken: string; listener: PacketListener }>>

  constructor(private socket: WebSocketClient, private readonly clock: Clock) {
    this.nextRequestToken = 0
    this.joinListeners = new Set()
    this.leaveListeners = new Set()
    this.packetListeners = new Map()
  }

  static of() {
    const uri = `${document.location!.origin}/nuclearnet`
    return new WebSocketProxyNUClearNetClient(
      WebWorkerWebSocketClient.of(uri, {
        upgrade: false,
        transports: ['websocket'],
      } as any),
      BrowserSystemClock,
    )
  }

  connect(options: NUClearNetOptions): () => void {
    this.socket.on('reconnect', this.onReconnect.bind(this, options))
    this.socket.connect()
    this.socket.send('nuclear_connect', options)

    // Does not send a nuclear_disconnect message, as all clients share a single server-side NUClearNet connection.
    return () => this.socket.disconnect()
  }

  onJoin(listener: NUClearEventListener): () => void {
    this.socket.on('nuclear_join', listener)
    this.joinListeners.add(listener)
    return () => {
      this.socket.off('nuclear_join', listener)
      this.joinListeners.delete(listener)
    }
  }

  onLeave(listener: NUClearEventListener): () => void {
    this.socket.on('nuclear_leave', listener)
    this.leaveListeners.add(listener)
    return () => {
      this.socket.off('nuclear_leave', listener)
      this.leaveListeners.delete(listener)
    }
  }

  on(event: string, cb: NUClearPacketListener): () => void {
    /*
     * This one is a bit more complicated than the others, mostly for performance purposes.
     *
     * The intent is to avoid WebSocketProxyNUClearNetServer sending all packets to the client, regardless of whether
     * they subscribed or not. Ideally we only send packets to a client that they are actively interested in listening
     * to that type of message. So we first request the type of message, with a 'listen' command. Then we listen to
     * that type of message. On unsubscribe, we send an unlisten command, to prevent listening.
     *
     * We use a request token to uniquely identify each 'listen' call, and so that we can 'unlisten' that same
     * subscription later.
     *
     * You can see this in practice when the client starts/stops receiving localisation events (e.g. Sensors) when
     * they focus/unfocus the localisation tab.
     */
    const requestToken = String(this.nextRequestToken++)
    this.socket.send('listen', event, requestToken)
    const listener = (packet: NUClearNetPacket, ack?: (processingTime: number) => void) => {
      const start = this.clock.performanceNow()
      cb(packet)
      ack?.(this.clock.performanceNow() - start)
    }
    this.socket.on(event, listener)

    let packetListeners = this.packetListeners.get(event)
    if (!packetListeners) {
      packetListeners = new Set()
      this.packetListeners.set(event, packetListeners)
    }
    const packetListener = { requestToken, listener }
    packetListeners.add(packetListener)

    return () => {
      this.socket.send('unlisten', requestToken)
      this.socket.off(event, listener)

      const packetListeners = this.packetListeners.get(event)
      if (packetListeners) {
        packetListeners.delete(packetListener)
      }
    }
  }

  onPacket(cb: NUClearPacketListener): () => void {
    return this.on('nuclear_packet', cb)
  }

  send(options: NUClearNetSend): void {
    this.socket.send('packet', options)
  }

  private onReconnect = (options: NUClearNetOptions) => {
    this.socket.send('nuclear_connect', options)

    // We assume the server could have crashed during a reconnection. We need to restore all our listeners so that
    // a browser refresh is not necessary.
    for (const joinListener of this.joinListeners) {
      this.socket.on('nuclear_join', joinListener)
    }

    for (const leaveListener of this.leaveListeners) {
      this.socket.on('nuclear_leave', leaveListener)
    }

    for (const [event, packetListeners] of this.packetListeners.entries()) {
      for (const packetListener of packetListeners) {
        this.socket.send('listen', event, packetListener.requestToken)
        this.socket.on(event, packetListener.listener)
      }
    }
  }
}
