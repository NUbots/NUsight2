import * as SocketIO from 'socket.io'
import { Server } from 'net'
import SocketIOServer = SocketIO.Server
import SocketIOSocket = SocketIO.Socket

export const SOCKET_IO_PATH = 'nuclear_net'

export class NUClearNetWebSocketProxyServer {
  public constructor(private server: SocketIOServer) {
    server.on('connection', this.onClientConnection)
  }

  public static of(server: Server) {
    const socketIOServer = SocketIO(server, { path: SOCKET_IO_PATH})
    return new NUClearNetWebSocketProxyServer(socketIOServer)
  }

  private onClientConnection = (socket: SocketIOSocket) => {
    console.log('yo');
  }
}
