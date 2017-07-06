import { NUClearNet } from 'nuclearnet.js'
import { NUClearNetSocket } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearNetOptions } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearNetSend } from '../../shared/nuclearnet/nuclearnet_types'

export class NUClearNetDirectSocket implements NUClearNetSocket {
  public constructor(private nuclearNetwork: NUClearNet) {
  }

  public static of(): NUClearNetDirectSocket {
    const nuclearNetwork = new NUClearNet()
    return new NUClearNetDirectSocket(nuclearNetwork)
  }

  public connect(options: NUClearNetOptions): () => void {
    this.nuclearNetwork.connect(options)
    return () => this.nuclearNetwork.disconnect()
  }

  public onJoin(cb: NUClearEventListener): () => void {
    this.nuclearNetwork.on('nuclear_join', cb)
    return () => this.nuclearNetwork.removeListener('nuclear_join', cb)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    this.nuclearNetwork.on('nuclear_leave', cb)
    return () => this.nuclearNetwork.removeListener('nuclear_leave', cb)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    this.nuclearNetwork.on(event, cb)
    return () => this.nuclearNetwork.removeListener(event, cb)
  }

  public send(options: NUClearNetSend): void {
    this.nuclearNetwork.send(options)
  }
}
