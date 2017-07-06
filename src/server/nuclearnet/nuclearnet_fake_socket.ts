import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearNetSocket } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearNetFakeServer } from './nuclearnet_fake_server'

export class NUClearNetFakeSocket implements NUClearNetSocket {
  public constructor(private server: NUClearNetFakeServer) {
  }

  public static of(): NUClearNetFakeSocket {
    return new NUClearNetFakeSocket(NUClearNetFakeServer.of())
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
