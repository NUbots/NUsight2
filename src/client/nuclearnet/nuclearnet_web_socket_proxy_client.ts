import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import * as SocketIO from 'socket.io-client'
import { NUClearNetSocket } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_types'
import SocketIOSocket = SocketIOClient.Socket

export class NUClearNetWebSocketProxyClient implements NUClearNetSocket {
  private sioSocket: SocketIOSocket
  private nextMessageId: number

  public constructor() {
    this.nextMessageId = 0
  }

  public static of() {
    return new NUClearNetWebSocketProxyClient()
  }

  public connect(options: NUClearNetOptions): () => void {
    this.sioSocket = SocketIO.connect(`${document.location.origin}/nuclearnet`, {
      upgrade: false,
      transports: ['websocket'],
    })
    this.sioSocket.emit('nuclear_connect', options)
    return () => {
      this.sioSocket.emit('nuclear_disconnect')
      this.sioSocket.disconnect()
    }
  }

  public onJoin(cb: NUClearEventListener): () => void {
    this.sioSocket.on('nuclear_join', cb)
    return () => this.sioSocket.off('nuclear_join', cb)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    this.sioSocket.on('nuclear_leave', cb)
    return () => this.sioSocket.off('nuclear_leave', cb)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    const messageId = String(this.nextMessageId++)
    this.sioSocket.emit('listen', event, messageId)
    this.sioSocket.on(event, cb)
    return () => {
      this.sioSocket.emit('unlisten', messageId)
      this.sioSocket.off(event, cb)
    }
  }

  public send(options: NUClearNetSend): void {
    this.sioSocket.send(options)
  }
}
