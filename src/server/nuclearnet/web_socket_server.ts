import * as SocketIO from 'socket.io'

/**
 * The thinnest wrapper possible around the Socket IO server interface. This exists to assist testing
 * WebSocketProxyNUClearNetServer by giving a concrete class which can be mocked.
 *
 * There should never be enough logic in here that it needs any testing.
 */
export class WebSocketServer {
  public constructor(private sioServer: SocketIO.Namespace) {
  }

  public static create(server: SocketIO.Namespace) {
    return new WebSocketServer(server)
  }

  public onConnection(cb: (socket: WebSocket) => void) {
    this.sioServer.on('connection', (socket: SocketIO.Socket) => {
      const webSocket = WebSocket.create(socket)
      cb(webSocket)
    })
  }
}

export class WebSocket {
  public constructor(private sioSocket: SocketIO.Socket) {
  }

  public static create(socket: SocketIO.Socket) {
    return new WebSocket(socket)
  }

  public on(event: string, cb: (...args: any[]) => void) {
    this.sioSocket.on(event, cb)
  }

  public send(event: string, ...args: any[]) {
    this.sioSocket.emit(event, ...args)
  }
}
