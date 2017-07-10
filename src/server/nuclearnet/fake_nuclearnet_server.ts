import * as EventEmitter from 'events'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { createSingletonFactory } from '../../shared/base/create_singleton_factory'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'

export class FakeNUClearNetServer {
  public messageLog: any[]
  private events: EventEmitter
  private peers: NUClearNetPeer[]

  public constructor() {
    this.messageLog = []
    this.events = new EventEmitter()
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
      // TODO (Annable): Support Opts.target
      this.emit(opts.type, packet)
    }
  }

  public on(event: string, listener: NUClearPacketListener) {
    this.events.on(event, listener)
    return () => this.events.removeListener(event, listener)
  }

  private emit(event: string, ...args: any[]) {
    this.messageLog.push({ event, args })
    this.events.emit(event, ...args)
  }
}
