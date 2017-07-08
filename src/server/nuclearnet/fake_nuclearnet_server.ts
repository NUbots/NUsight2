import * as EventEmitter from 'events'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { createSingletonFactory } from '../../shared/base/create_singleton_factory'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'

export class FakeNUClearNetServer {
  private events: EventEmitter
  private peers: NUClearNetPeer[]

  public constructor() {
    this.events = new EventEmitter()
    this.peers = []
  }

  public static of = createSingletonFactory(() => {
    return new FakeNUClearNetServer()
  })

  public connect(peer: NUClearNetPeer): void {
    this.events.emit('nuclear_join', peer)
    this.peers.push(peer)
  }

  public disconnect(peer: NUClearNetPeer) {
    this.events.emit('nuclear_leave', peer)
    this.peers.splice(this.peers.indexOf(peer), 1)
  }

  public onJoin(cb: NUClearEventListener): () => void {
    this.events.on('nuclear_join', cb)
    return () => {
      this.events.removeListener('nuclear_join', cb)
    }
  }

  public onLeave(cb: NUClearEventListener): () => void {
    this.events.on('nuclear_leave', cb)
    return () => {
      this.events.removeListener('nuclear_leave', cb)
    }
  }

  public send(peer: NUClearNetPeer, opts: NUClearNetSend) {
    if (typeof opts.type === 'string') {
      const packet = {
        peer,
        payload: opts.payload,
      }
      // TODO (Annable): Support opts.target
      this.events.emit(opts.type, packet)
    }
  }
}
