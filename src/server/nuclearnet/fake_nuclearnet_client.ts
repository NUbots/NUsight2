import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetSend } from 'nuclearnet.js'
import { NUClearEventListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearPacketListener } from '../../shared/nuclearnet/nuclearnet_client'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNetServer } from './fake_nuclearnet_server'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import { EventEmitter } from 'events'

export class FakeNUClearNetClient implements NUClearNetClient {
  public peer: NUClearNetPeer
  private events = new EventEmitter()
  private connected: boolean

  public constructor(private server: FakeNUClearNetServer) {
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
      port: 7447,
    }
    this.connected = true
    this.server.connect(this)

    return () => {
      this.connected = false
      this.server.disconnect(this)
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
    const listener = (packet: NUClearNetPacket) => {
      if (this.connected) {
        cb(packet)
      }
    }
    this.events.on(event, listener)
    return () => this.events.removeListener(event, listener)
  }

  public send(options: NUClearNetSend): void {
    this.server.send(this.peer, options)
  }

  // Fake helpers

  public fakeJoin(peer: NUClearNetPeer) {
    this.events.emit('nuclear_join', peer)
  }

  public fakeLeave(peer: NUClearNetPeer) {
    this.events.emit('nuclear_leave', peer)
  }

  public fakePacket(event: string, packet: NUClearNetPacket) {
    this.events.emit(event, packet)
  }
}
