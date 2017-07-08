import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetServer } from './fake_nuclearnet_server'
import { NUClearNetPeer } from 'nuclearnet.js'

export class FakeNUClearNetClient implements NUClearNetClient {
  private peer: NUClearNetPeer

  public constructor(private server: FakeNUClearNetServer) {
  }

  public static of(): FakeNUClearNetClient {
    return new FakeNUClearNetClient(FakeNUClearNetServer.of())
  }

  public connect(options: NUClearNetOptions): () => void {
    this.peer = {
      name: options.name,
      address: 'localhost',
      port: 1234,
    }
    this.server.connect(this.peer)

    return () => {
      this.server.disconnect(this.peer)
    }
  }

  public onJoin(cb: NUClearEventListener): () => void {
    return this.server.onJoin(cb)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    return this.server.onLeave(cb)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    throw new Error('Not implemented')
  }

  public send(options: NUClearNetSend): void {
    throw new Error('Not implemented')
  }
}
