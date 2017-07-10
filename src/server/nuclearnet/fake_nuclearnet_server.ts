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

  /**
   * Designed to only have a single instance during runtime. This singleton is mimicking the behaviour of
   * the real NUClearNet, where a single global TCP/IP network is an implicit non-injectable dependency. This is why
   * FakeNUClearNetClient.of() does not take a given server and instead uses the singleton instance.
   *
   * Avoid using this singleton factory in tests though, as you'll have introduce cross-contamination between tests.
   * Simply use the constructor of both FakeNUClearNetServer and FakeNUClearNetClient instead.
   */
  public static of = createSingletonFactory(() => {
    return new FakeNUClearNetServer()
  })

  public connect(peer: NUClearNetPeer): void {
    this.emit('nuclear_join', peer)
    this.peers.push(peer)

    // TODO (Annable): Send nuclear_join events for all connected peers to the newly connected peer.
    // for (const peer of this.peers) {
    //   this.emit('nuclear_join', peer)
    // }
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
