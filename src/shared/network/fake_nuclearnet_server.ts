import * as EventEmitter from 'events'
import { createSingletonFactory } from '../base/create_singleton_factory'
import { NUClearNetPeer } from './nuclearnet_types'
import { NUClearNetSend } from './nuclearnet_types'

export class FakeNUClearNetServer extends EventEmitter {
  private peers: NUClearNetPeer[]

  public constructor() {
    super()

    this.peers = []
  }

  public static of = createSingletonFactory(() => {
    return new FakeNUClearNetServer()
  })

  public connect(peer: NUClearNetPeer): void {
    this.emit('nuclear_join', peer)
    this.peers.push(peer)
  }

  public disconnect(peer: NUClearNetPeer) {
    this.emit('nuclear_leave', peer)
    this.peers.splice(this.peers.indexOf(peer), 1)
  }

  public send(peer: NUClearNetPeer, opts: NUClearNetSend) {
    if (typeof opts.type === 'string') {
      const packet = {
        peer,
        payload: opts.payload,
      }
      // TODO (Annable): Support opts.target
      this.emit(opts.type, packet)
    }
  }
}
