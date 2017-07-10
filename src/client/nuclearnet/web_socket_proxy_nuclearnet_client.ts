import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { WebSocketClient } from './web_socket_client'
import SocketIOSocket = SocketIOClient.Socket

export class WebSocketProxyNUClearNetClient implements NUClearNetClient {
  private nextMessageId: number

  public constructor(private socket: WebSocketClient) {
    this.nextMessageId = 0
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

  public onJoin(cb: NUClearEventListener): () => void {
    this.socket.on('nuclear_join', cb)
    return () => this.socket.off('nuclear_join', cb)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    this.socket.on('nuclear_leave', cb)
    return () => this.socket.off('nuclear_leave', cb)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    const messageId = String(this.nextMessageId++)
    this.socket.send('listen', event, messageId)
    this.socket.on(event, cb)
    return () => {
      this.socket.send('unlisten', messageId)
      this.socket.off(event, cb)
    }
  }

  public send(options: NUClearNetSend): void {
    if (typeof options.type === 'string') {
      this.socket.send(options.type, options)
    }
  }

  private onReconnect = (options: NUClearNetOptions) => {
    this.socket.send('nuclear_connect', options)
    // TODO (Annable): Also re-listen to everything D:
  }
}
