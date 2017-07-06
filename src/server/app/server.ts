import Server = SocketIO.Server
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/network/nuclearnet_client'
import { Client } from './client'
import { Robot } from './robot'
import Socket = SocketIO.Socket
import { NUClearNetFakeSocket } from '../../shared/network/nuclearnet_fake_socket'
import { NUClearNetDirectSocket } from '../../shared/network/nuclearnet_direct_socket'

export class NUSightServer {
  private clients: Client[]
  private robots: Robot[]

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private sioNetwork: Server) {
    this.clients = []
    this.robots = []

    this.nuclearnetClient.onJoin(this.onNUClearJoin)
    this.nuclearnetClient.onLeave(this.onNUClearLeave)
    this.sioNetwork.on('connection', this.onClientConnection)
  }

  public static of(fakeNetworking: boolean, sioNetwork: Server): NUSightServer {
    const nuclearClient = NUClearNetClient.of(fakeNetworking ? NUClearNetFakeSocket.of() : NUClearNetDirectSocket.of())
    return new NUSightServer(nuclearClient, sioNetwork)
  }

  public connect(): () => void {
    return this.nuclearnetClient.connect({ name: 'nusight' })
  }

  private onNUClearJoin = (peer: NUClearNetPeer) => {
    // tslint:disable-next-line no-console
    console.log(`Peer "${peer.name}" from ${peer.address} joined the NUClear network.`)
    const robot = Robot.of({
      name: peer.name,
    })
    this.robots.push(robot)
  }

  private onNUClearLeave = (peer: NUClearNetPeer) => {
    // tslint:disable-next-line no-console
    console.log(`Peer "${peer.name}" from ${peer.address} left the NUClear network.`)
    const index = this.robots.findIndex(robot => robot.name === peer.name)
    if (index >= 0) {
      this.robots.splice(index, 1)
    }
  }

  private onClientConnection = (sioSocket: Socket) => {
    const address = sioSocket.client.conn.remoteAddress
    // tslint:disable-next-line no-console
    console.log(`Client "${sioSocket.id}" from ${address} connected (Total: ${this.clients.length + 1})`)
    const client = Client.of({
      nuclearnetClient: this.nuclearnetClient,
      sioSocket,
      onDisconnectCallback: () => {
        this.clients.splice(this.clients.indexOf(client), 1)
        // tslint:disable-next-line no-console
        console.log(`Client "${sioSocket.id}" from ${address} disconnected (Total: ${this.clients.length})`)
      },
    })
    this.clients.push(client)
  }
}
