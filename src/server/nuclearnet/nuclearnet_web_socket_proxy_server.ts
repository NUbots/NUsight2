import { NUClearNetOptions } from 'nuclearnet.js'
import * as SocketIO from 'socket.io'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearNetDirectSocket } from './nuclearnet_direct_socket'
import { NUClearNetFakeSocket } from './nuclearnet_fake_socket'
import SocketIOServer = SocketIO.Server
import SocketIOSocket = SocketIO.Socket
import Namespace = SocketIO.Namespace

type Options = {
  fakeNetworking: boolean
}

export class NUClearNetWebSocketProxyServer {
public constructor(private server: Namespace, private nuclearnetClient: NUClearNetClient) {
    server.on('connection', this.onClientConnection)
  }

  public static of(server: Namespace, opts: Options): NUClearNetWebSocketProxyServer {
    const nuclearnetClient: NUClearNetClient = opts.fakeNetworking ? NUClearNetFakeSocket.of() : NUClearNetDirectSocket.of()
    return new NUClearNetWebSocketProxyServer(server, nuclearnetClient)
  }

  private onClientConnection = (socket: SocketIOSocket) => {
    const listeners = new Map()

    const offJoin = this.nuclearnetClient.onJoin(peer => socket.emit('nuclear_join', peer))

    const offLeave = this.nuclearnetClient.onLeave(peer => socket.emit('nuclear_leave', peer))

    socket.on('nuclear_connect', (options: NUClearNetOptions) => {
      const disconnect = this.nuclearnetClient.connect(options)
      socket.on('nuclear_disconnect', () => disconnect())
    })

    socket.on('listen', (event: string, messageId: string) => {
      const off = this.nuclearnetClient.on(event, packet => socket.emit('nuclear_message', event, packet))

      let listenerIds = listeners.get(event)
      if (!listenerIds) {
        listenerIds = new Map()
        listeners.set(event, listenerIds)
      }
      listenerIds.set(messageId, off)
    })

    socket.on('unlisten', (event: string, messageId: string) => {
      const listenerIds = listeners.get(event)
      if (listenerIds) {
        const off = listenerIds.get(messageId)
        if (off) {
          off()
        }
      }
    })

    socket.on('disconnect', () => {
      offJoin()
      offLeave()
      for (const listenerIds of listeners) {
        for (const off of listenerIds.values()) {
          off()
        }
      }
    })
  }
}
