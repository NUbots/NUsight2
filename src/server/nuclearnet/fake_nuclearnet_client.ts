import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetServer } from './fake_nuclearnet_server'

export class FakeNUClearNetClient implements NUClearNetClient {
  public constructor(private server: FakeNUClearNetServer) {
  }

  public static of(): FakeNUClearNetClient {
    return new FakeNUClearNetClient(FakeNUClearNetServer.of())
  }

  public connect(options: NUClearNetOptions): () => void {
    throw new Error('Not implemented')
  }

  public onJoin(cb: NUClearEventListener): () => void {
    throw new Error('Not implemented')
  }

  public onLeave(cb: NUClearEventListener): () => void {
    throw new Error('Not implemented')
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    throw new Error('Not implemented')
  }

  public send(options: NUClearNetSend): void {
    throw new Error('Not implemented')
  }
}
