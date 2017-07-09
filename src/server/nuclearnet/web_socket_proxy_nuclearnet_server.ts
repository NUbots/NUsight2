import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { DirectNUClearNetClient } from './direct_nuclearnet_client'
import { FakeNUClearNetClient } from './fake_nuclearnet_client'
import { WebSocketServer } from './web_socket_server'
import { WebSocket } from './web_socket_server'

type Options = {
  fakeNetworking: boolean
}

export class WebSocketProxyNUClearNetServer {
  public constructor(private server: WebSocketServer, private nuclearnetClient: NUClearNetClient) {
    server.onConnection(this.onClientConnection)
  }

  public static of(server: WebSocketServer, { fakeNetworking }: Options): WebSocketProxyNUClearNetServer {
    const nuclearnetClient: NUClearNetClient = fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
    return new WebSocketProxyNUClearNetServer(server, nuclearnetClient)
  }

  private onClientConnection = (socket: WebSocket) => {
    const listeners: Map<string, Map<string, () => void>> = new Map()

    const offJoin = this.nuclearnetClient.onJoin(peer => socket.send('nuclear_join', peer))

    const offLeave = this.nuclearnetClient.onLeave(peer => socket.send('nuclear_leave', peer))

    socket.on('nuclear_connect', (options: NUClearNetOptions) => {
      const disconnect = this.nuclearnetClient.connect(options)
      socket.on('nuclear_disconnect', () => disconnect())
    })

    socket.on('listen', (event: string, messageId: string) => {
      const off = this.nuclearnetClient.on(event, packet => socket.send(event, packet))

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
      for (const listenerIds of listeners.values()) {
        for (const off of listenerIds.values()) {
          off()
        }
      }
    })
  }
}
