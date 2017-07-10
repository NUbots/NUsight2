import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { WebSocketClient } from './web_socket_client'
import SocketIOSocket = SocketIOClient.Socket

export class WebSocketProxyNUClearNetClient implements NUClearNetClient {
  private nextMessageId: number
  private joinListeners: Set<NUClearEventListener>
  private leaveListeners: Set<NUClearEventListener>
  private packetListeners: Map<string, Set<{ messageId: string, listener: NUClearPacketListener }>>

  public constructor(private socket: WebSocketClient) {
    this.nextMessageId = 0
    this.joinListeners = new Set()
    this.leaveListeners = new Set()
    this.packetListeners = new Map()
  }

  public static of() {
    return new WebSocketProxyNUClearNetClient(WebSocketClient.of())
  }

  public connect(options: NUClearNetOptions): () => void {
    this.socket.connect(`${document.location.origin}/nuclearnet`, {
      upgrade: false,
      transports: ['websocket'],
    })

    this.socket.on('reconnect', this.onReconnect.bind(this, options))
    this.socket.send('nuclear_connect', options)

    return () => {
      this.socket.send('nuclear_disconnect')
      this.socket.disconnect()
    }
  }

  public onJoin(listener: NUClearEventListener): () => void {
    this.socket.on('nuclear_join', listener)
    this.joinListeners.add(listener)
    return () => {
      this.socket.off('nuclear_join', listener)
      this.joinListeners.delete(listener)
    }
  }

  public onLeave(listener: NUClearEventListener): () => void {
    this.socket.on('nuclear_leave', listener)
    this.leaveListeners.add(listener)
    return () => {
      this.socket.off('nuclear_leave', listener)
      this.leaveListeners.delete(listener)
    }
  }

  public on(event: string, listener: NUClearPacketListener): () => void {
    const messageId = String(this.nextMessageId++)
    this.socket.send('listen', event, messageId)
    this.socket.on(event, listener)

    let packetListeners = this.packetListeners.get(event)
    if (!packetListeners) {
      packetListeners = new Set()
      this.packetListeners.set(event, packetListeners)
    }
    const packetListener = { messageId, listener }
    packetListeners.add(packetListener)

    return () => {
      this.socket.send('unlisten', messageId)
      this.socket.off(event, listener)

      const packetListeners = this.packetListeners.get(event)
      if (packetListeners) {
        packetListeners.delete(packetListener)
      }
    }
  }

  public send(options: NUClearNetSend): void {
    if (typeof options.type === 'string') {
      this.socket.send(options.type, options)
    }
  }

  private onReconnect = (options: NUClearNetOptions) => {
    this.socket.send('nuclear_connect', options)

    // Restore all our listeners
    for (const joinListener of this.joinListeners) {
      this.socket.on('nuclear_join', joinListener)
    }

    for (const leaveListener of this.leaveListeners) {
      this.socket.on('nuclear_leave', leaveListener)
    }

    for (const [event, packetListeners] of this.packetListeners.entries()) {
      for (const packetListener of packetListeners) {
        this.socket.send('listen', event, packetListener.messageId)
        this.socket.on(event, packetListener.listener)
      }
    }
  }
}
