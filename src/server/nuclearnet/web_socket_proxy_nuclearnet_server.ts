import { NUClearNetOptions } from 'nuclearnet.js'
import * as SocketIO from 'socket.io'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_types'
import { DirectNUClearNetClient } from './direct_nuclearnet_client'
import { FakeNUClearNetClient } from './fake_nuclearnet_client'
import SocketIOServer = SocketIO.Server
import SocketIOSocket = SocketIO.Socket
import Namespace = SocketIO.Namespace

type Options = {
  fakeNetworking: boolean
}

export class WebSocketProxyNUClearNetServer {
  public constructor(private server: Namespace, private nuclearnetClient: NUClearNetClient) {
    server.on('connection', this.onClientConnection)
  }

  public static of(server: Namespace, { fakeNetworking }: Options): WebSocketProxyNUClearNetServer {
    const nuclearnetClient: NUClearNetClient = fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
    return new WebSocketProxyNUClearNetServer(server, nuclearnetClient)
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
