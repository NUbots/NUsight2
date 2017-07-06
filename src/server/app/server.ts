import Namespace = SocketIO.Namespace
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_types'
import { DirectNUClearNetClient } from '../nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from '../nuclearnet/fake_nuclearnet_client'
import { Client } from './client'
import { Robot } from './robot'
import Socket = SocketIO.Socket

export class NUSightServer {
  private clients: Client[]
  private robots: Robot[]

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private sioNetwork: Namespace) {
    this.clients = []
    this.robots = []

    this.nuclearnetClient.onJoin(this.onNUClearJoin)
    this.nuclearnetClient.onLeave(this.onNUClearLeave)
    this.sioNetwork.on('connection', this.onClientConnection)
  }

  public static of(fakeNetworking: boolean, sioNetwork: Namespace): NUSightServer {
    const nuclearClient: NUClearNetClient = fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
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
