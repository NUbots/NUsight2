import * as SocketIO from 'socket.io'
import SocketIOServer = SocketIO.Server
import SocketIOSocket = SocketIO.Socket
import Namespace = SocketIO.Namespace

export class WebSocketServer {
  public static of() {
    return new WebSocketServer()
  }

  onConnection(cb: (socket: WebSocket) => void) {
    throw new Error('Not implemented')
  }
}

export class WebSocket {
  on(event: string, cb: (...args: any[]) => void) {
    throw new Error('Not implemented')
  }

  send(event: string, ...args: any[]) {
    throw new Error('Not implemented')
  }
}
