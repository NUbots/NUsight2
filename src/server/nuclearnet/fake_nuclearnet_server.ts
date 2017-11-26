import * as EventEmitter from 'events'
import { NUClearNetSend } from 'nuclearnet.js'
import * as XXH from 'xxhashjs'
import { createSingletonFactory } from '../../shared/base/create_singleton_factory'
import { FakeNUClearNetClient } from './fake_nuclearnet_client'

/**
 * A fake in-memory NUClearNet 'server' which routes messages between each FakeNUClearNetClient.
 *
 * All messages are 'reliable' in that nothing is intentially dropped.
 * Targeted messages are supported.
 */
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
   * FakeNUClearNetClient.create() does not take a given server and instead uses the singleton instance.
   *
   * Avoid using this singleton factory in tests though, as you'll introduce cross-contamination between tests.
   * Simply use the constructor of both FakeNUClearNetServer and FakeNUClearNetClient instead.
   */
  public static create = createSingletonFactory(() => {
    return new FakeNUClearNetServer()
  })

  public connect(client: FakeNUClearNetClient): () => void {
    this.events.emit('nuclear_join', client.peer)
    this.clients.push(client)

    for (const otherClient of this.clients) {
      // This ensures that the newly connected client receives a nuclear_join event from everyone else on the network.
      client.fakeJoin(otherClient.peer)

      // This conditional avoids sending nuclear_join twice to the newly connected client.
      if (otherClient !== client) {
        // Send a single nuclear_join to everyone on the network about the newly connected client.
        otherClient.fakeJoin(client.peer)
      }
    }

    return () => {
      this.events.emit('nuclear_leave', client.peer)
      this.clients.splice(this.clients.indexOf(client), 1)

      for (const otherClient of this.clients) {
        otherClient.fakeLeave(client.peer)
      }
    }
  }

  public send(client: FakeNUClearNetClient, opts: NUClearNetSend) {
    const hash: Buffer = typeof opts.type === 'string' ? hashType(opts.type) : opts.type
    const packet = {
      peer: client.peer,
      type: typeof opts.type === 'string' ? opts.type : undefined,
      hash,
      payload: opts.payload,
      reliable: !!opts.reliable,
    }

    /*
     * This list intentionally includes the sender unless explicitly targeting another peer. This matches the real
     * NUClearNet behaviour.
     */
    const targetClients = opts.target === undefined
      ? this.clients
      : this.clients.filter(otherClient => otherClient.peer.name === opts.target)

    const hashString = hash.toString('hex')
    for (const client of targetClients) {
      client.fakePacket(hashString, packet)
    }
  }
}

export function hashType(type: string): Buffer {
  // Matches hashing implementation from NUClearNet
  // See https://goo.gl/6NDPo2
  const hashString: string = XXH.h64(type, 0x4e55436c).toString(16)
  return Buffer.from((hashString.match(/../g) as string[]).reverse().join(''), 'hex')
}
