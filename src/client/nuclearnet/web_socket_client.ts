import * as SocketIO from 'socket.io-client'

export class WebSocketClient {
  private socket: SocketIOClient.Socket

  public constructor() {
  }

  public static of() {
    return new WebSocketClient()
  }

  public connect(uri: string, opts?: SocketIOClient.ConnectOpts) {
    this.socket = SocketIO.connect(uri, opts)
  }

  public disconnect() {
    this.socket.disconnect()
  }

  public on(event: string, fn: Function) {
    this.socket.on(event, fn)
  }

  public off(event: string, fn?: Function) {
    this.socket.off(event, fn)
  }

  public send(event: string, ...args: any[]) {
    this.socket.emit(event, ...args)
  }
}
