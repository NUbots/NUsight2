import { FakeNUClearNetServer } from './fake_nuclearnet_server'
import { NUClearNetSocket } from './nuclearnet_types'
import { NUClearEventListener } from './nuclearnet_types'
import { NUClearPacketListener } from './nuclearnet_types'
import { NUClearNetOptions } from './nuclearnet_types'
import { NUClearNetSend } from './nuclearnet_types'

export class NUClearNetFakeSocket implements NUClearNetSocket {
  public constructor(private server: FakeNUClearNetServer) {
  }

  public static of(): NUClearNetFakeSocket {
    return new NUClearNetFakeSocket(FakeNUClearNetServer.of())
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
