import * as SocketIO from 'socket.io'
import SocketIOServer = SocketIO.Server
import SocketIOSocket = SocketIO.Socket
import Namespace = SocketIO.Namespace

export class WebSocketServer {
  public static of() {
    return new WebSocketServer()
  }

  public onConnection(cb: (socket: WebSocket) => void) {
    throw new Error('Not implemented')
  }
}

export class WebSocket {
  public on(event: string, cb: (...args: any[]) => void) {
    throw new Error('Not implemented')
  }

  public send(event: string, ...args: any[]) {
    throw new Error('Not implemented')
  }
}
