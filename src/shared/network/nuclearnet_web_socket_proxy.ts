import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import * as SocketIO from 'socket.io-client'
import { NUClearNetSocket } from './nuclearnet_types'
import { NUClearPacketListener } from './nuclearnet_types'
import { NUClearEventListener } from './nuclearnet_types'
import SocketIOSocket = SocketIOClient.Socket

export class NUClearNetWebSocketProxy implements NUClearNetSocket {
  private sioSocket: SocketIOSocket

  public constructor() {
  }

  public static of() {
    return new NUClearNetWebSocketProxy()
  }

  public connect(options: NUClearNetOptions): () => void {
    const opts = { upgrade: false, transports: ['websocket'] }
    this.sioSocket = SocketIO.connect(opts)
    return () => this.sioSocket.disconnect()
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
    this.sioSocket.on(event, cb)
    return () => this.sioSocket.off(event, cb)
  }

  public send(options: NUClearNetSend): void {
    this.sioSocket.send(options)
  }
}
