import { NUClearNet } from 'nuclearnet.js'
import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_types'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_types'

export class DirectNUClearNetClient implements NUClearNetClient {
  public constructor(private nuclearNetwork: NUClearNet) {
  }

  public static of(): DirectNUClearNetClient {
    const nuclearNetwork = new NUClearNet()
    return new DirectNUClearNetClient(nuclearNetwork)
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
