import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'

export type StreamEvent = StreamPacket | StreamJoinEvent | StreamLeaveEvent
export type StreamPacket = { type: 'packet', packet: NUClearNetPacket }
export type StreamJoinEvent = { type: 'nuclear_join', peer: NUClearNetPeer }
export type StreamLeaveEvent = { type: 'nuclear_leave', peer: NUClearNetPeer }

export class NUClearNetStream extends stream.Readable {
  private buffer: StreamPacket[] = []
  private buffering = false

  constructor(private nuclearnetClient: NUClearNetClient, private highWaterMark: number = 16) {
    super({
      objectMode: true,
      highWaterMark,
    })
    nuclearnetClient.onPacket(this.onPacket)
    nuclearnetClient.onJoin(this.onJoin)
    nuclearnetClient.onLeave(this.onLeave)
  }

  public static of(nuclearnetClient: NUClearNetClient, highWaterMark: number) {
    return new NUClearNetStream(nuclearnetClient, highWaterMark)
  }

  public push(event: StreamEvent | null): boolean {
    return super.push(event)
  }

  private bufferEvent(event: StreamPacket) {
    this.buffer.push(event)
  }

  private onDrain = () => {
    this.buffering = false
    while (this.buffer.length > 0) {
      const event = this.buffer.shift()!
      if (!this.onPacket(event.packet)) {
        break
      }
    }
  }

  private onPacket = (packet: NUClearNetPacket): boolean => {
    const event: StreamPacket = { type: 'packet', packet }
    if (this.buffering) {
      this.bufferEvent(event)
      return false
    } else if (!this.push(event)) {
      this.buffering = true
      return false
    }
    return true
  }

  private onJoin = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_join', peer })
  }

  private onLeave = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_leave', peer })
  }

  public _read(size: number) {
    if (this.buffering) {
      this.onDrain()
    }
  }

  // TODO (Annable): Automatically end when client disconnects?
  public end() {
    this.push(null)
  }
}

export class PeerFilter extends stream.Transform {
  constructor(private peer: NUClearNetPeer) {
    super({
      objectMode: true,
    })
  }

  static of(peer: NUClearNetPeer) {
    return new PeerFilter(peer)
  }

  push(event: StreamEvent | null): boolean {
    return super.push(event)
  }

  write(event: StreamEvent) {
    return super.write(event)
  }

  _transform(event: StreamEvent, encoding: string, done: (err?: any, data?: any) => void) {
    if (event.type !== 'packet' || this.isPeer(event.packet.peer)) {
      this.push(event)
    }
    done()
  }

  isPeer(otherPeer: NUClearNetPeer) {
    return (
      otherPeer.name === this.peer.name
      && otherPeer.address === this.peer.address
      && otherPeer.port === this.peer.port
    )
  }
}
