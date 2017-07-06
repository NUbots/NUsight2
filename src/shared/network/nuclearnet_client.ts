import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearNetSocket } from './nuclearnet_types'
import { NUClearPacketListener } from './nuclearnet_types'
import { NUClearEventListener } from './nuclearnet_types'
import { NUClearNetDirectSocket } from './nuclearnet_direct_socket'
import { NUClearNetFakeSocket } from './nuclearnet_fake_socket'
import { NUClearNetWebSocketProxyClient } from './nuclearnet_web_socket_proxy_client'

export class NUClearNetClient {
  public constructor(private socket: NUClearNetSocket) {
  }

  public static createDirect() {
    const socket = NUClearNetDirectSocket.of()
    return new NUClearNetClient(socket)
  }

  public static createWebSocketProxy() {
    const socket = NUClearNetWebSocketProxyClient.of()
    return new NUClearNetClient(socket)
  }

  public static createFake() {
    const socket = NUClearNetFakeSocket.of()
    return new NUClearNetClient(socket)
  }

  public connect(options: NUClearNetOptions): () => void {
    return this.socket.connect(options)
  }

  public onJoin(cb: NUClearEventListener): () => void {
    return this.socket.onJoin(cb)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    return this.socket.onLeave(cb)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    return this.socket.on(event, cb)
  }

  public send(options: NUClearNetSend): void {
    return this.socket.send(options)
  }
}
