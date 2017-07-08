import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetServer } from './fake_nuclearnet_server'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'

export class FakeNUClearNetClient implements NUClearNetClient {
  private connected: boolean
  private peer: NUClearNetPeer

  public constructor(private server: FakeNUClearNetServer) {
  }

  public static of(): FakeNUClearNetClient {
    return new FakeNUClearNetClient(FakeNUClearNetServer.of())
  }

  public connect(options: NUClearNetOptions): () => void {
    this.peer = {
      name: options.name,
      address: '127.0.0.1',
      port: 7447,
    }
    this.server.connect(this.peer)
    this.connected = true

    return () => {
      this.connected = false
      this.server.disconnect(this.peer)
    }
  }

  public onJoin(cb: NUClearEventListener): () => void {
    const listener = (peer: NUClearNetPeer) => {
      if (this.connected) {
        cb(peer)
      }
    }
    return this.server.onJoin(listener)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    const listener = (peer: NUClearNetPeer) => {
      if (this.connected) {
        cb(peer)
      }
    }
    return this.server.onLeave(listener)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    const listener = (packet: NUClearNetPacket) => {
      if (this.connected) {
        cb(packet)
      }
    }
    return this.server.on(event, listener)
  }

  public send(options: NUClearNetSend): void {
    this.server.send(this.peer, options)
  }
}
