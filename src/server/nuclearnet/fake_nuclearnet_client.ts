import { EventEmitter } from 'events'
import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetServer } from './fake_nuclearnet_server'
import { hashType } from './fake_nuclearnet_server'

/**
 * A fake NUClearNetClient, which collaborates with FakeNUClearNetServer. Designed to allow completely offline
 * development of networked components, with the idea that if a component is built and tested using fake networking,
 * there should be a high level of confidence it will work with a real network and a real robot.
 *
 * The fake helpers are public, but only should be used by FakeNUClearNetServer.
 */
export class FakeNUClearNetClient implements NUClearNetClient {
  public peer: NUClearNetPeer
  private events: EventEmitter
  private connected: boolean

  public constructor(private server: FakeNUClearNetServer) {
    this.events = new EventEmitter()
    this.connected = false
  }

  /**
   * Avoid using this factory in tests as FakeNUClearNetServer.of() is a singleton. You'll get cross-contamination
   * between tests. Simply use the constructor of both FakeNUClearNetServer and FakeNUClearNetClient instead.
   */
  public static of(): FakeNUClearNetClient {
    return new FakeNUClearNetClient(FakeNUClearNetServer.of())
  }

  public connect(options: NUClearNetOptions): () => void {
    this.peer = {
      name: options.name,
      address: '127.0.0.1',
      // TODO (Annable): Inject a random function.
      port: Math.floor(Math.random() * (65536 - 1024) + 1024),
    }
    this.connected = true
    const disconnect = this.server.connect(this)

    return () => {
      this.connected = false
      disconnect()
    }
  }

  public onJoin(cb: NUClearEventListener): () => void {
    const listener = (peer: NUClearNetPeer) => {
      if (this.connected) {
        cb(peer)
      }
    }
    this.events.on('nuclear_join', listener)
    return () => this.events.removeListener('nuclear_join', listener)
  }

  public onLeave(cb: NUClearEventListener): () => void {
    const listener = (peer: NUClearNetPeer) => {
      if (this.connected) {
        cb(peer)
      }
    }
    this.events.on('nuclear_leave', listener)
    return () => this.events.removeListener('nuclear_leave', listener)
  }

  public on(event: string, cb: NUClearPacketListener): () => void {
    const hash = hashType(event).toString('hex')
    const listener = (packet: NUClearNetPacket) => {
      if (this.connected) {
        cb(packet)
      }
    }
    this.events.on(hash, listener)
    return () => this.events.removeListener(hash, listener)
  }

  public onPacket(cb: NUClearPacketListener): () => void {
    const listener = (packet: NUClearNetPacket) => {
      if (this.connected) {
        cb(packet)
      }
    }
    this.events.on('nuclear_packet', listener)
    return () => this.events.removeListener('nuclear_packet', listener)
  }

  public send(options: NUClearNetSend): void {
    this.server.send(this, options)
  }

  // Fake helpers, designed only to be used by FakeNUClearNetServer.
  public fakeJoin(peer: NUClearNetPeer) {
    this.events.emit('nuclear_join', peer)
  }

  public fakeLeave(peer: NUClearNetPeer) {
    this.events.emit('nuclear_leave', peer)
  }

  public fakePacket(hash: string, packet: NUClearNetPacket) {
    this.events.emit(hash, packet)
    this.events.emit('nuclear_packet', packet)
  }
}
