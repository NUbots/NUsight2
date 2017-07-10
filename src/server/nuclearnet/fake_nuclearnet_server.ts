import * as EventEmitter from 'events'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { createSingletonFactory } from '../../shared/base/create_singleton_factory'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetClient } from './fake_nuclearnet_client'

export class FakeNUClearNetServer {
  private events: EventEmitter
  private clients: FakeNUClearNetClient[]

  public constructor() {
    this.events = new EventEmitter()
    this.clients = []
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

  public connect(client: FakeNUClearNetClient): void {
    this.emit('nuclear_join', client.peer)
    this.clients.push(client)

    for (const otherClient of this.clients) {
      client.fakeJoin(otherClient.peer)
      if (otherClient !== client) {
        otherClient.fakeJoin(client.peer)
      }
    }
  }

  public disconnect(client: FakeNUClearNetClient) {
    this.emit('nuclear_leave', client.peer)
    this.clients.splice(this.clients.indexOf(client), 1)

    for (const otherClient of this.clients) {
      otherClient.fakeLeave(client.peer)
    }
  }

  public send(peer: NUClearNetPeer, opts: NUClearNetSend) {
    if (typeof opts.type === 'string') {
      const packet = {
        peer,
        payload: opts.payload,
      }

      const targetClients = opts.target === undefined
        ? this.clients
        : this.clients.filter(client => client.peer.name === opts.target)

      for (const client of targetClients) {
        client.fakePacket(opts.type, packet)
      }
    }
  }

  public on(event: string, listener: NUClearPacketListener) {
    this.events.on(event, listener)
    return () => this.events.removeListener(event, listener)
  }

  private emit(event: string, ...args: any[]) {
    this.events.emit(event, ...args)
  }
}
