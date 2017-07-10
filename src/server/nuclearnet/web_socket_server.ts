import * as SocketIO from 'socket.io'
import SocketIOServer = SocketIO.Server
import SocketIOSocket = SocketIO.Socket
import Namespace = SocketIO.Namespace

export class WebSocketServer {
  public constructor(private sioServer: SocketIO.Namespace) {
  }

  public static of(server: Namespace) {
    return new WebSocketServer(server)
  }

  public onConnection(cb: (socket: WebSocket) => void) {
    this.sioServer.on('connection', (socket: SocketIO.Socket) => {
      const webSocket = WebSocket.of(socket)
      cb(webSocket)
    })
  }
}

export class WebSocket {
  public constructor(private sioSocket: SocketIO.Socket) {
  }

  public static of(socket: SocketIO.Socket) {
    return new WebSocket(socket)
  }

  public on(event: string, cb: (...args: any[]) => void) {
    this.sioSocket.on(event, cb)
  }

  public send(event: string, ...args: any[]) {
    this.sioSocket.emit(event, ...args)
  }
}