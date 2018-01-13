import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'

export type StreamEvent = StreamPacket | StreamJoinEvent | StreamLeaveEvent
export type StreamPacket = { type: 'packet', packet: NUClearNetPacket }
export type StreamJoinEvent = { type: 'nuclear_join', peer: NUClearNetPeer }
export type StreamLeaveEvent = { type: 'nuclear_leave', peer: NUClearNetPeer }

export class NUClearNetStream extends stream.Readable {
  constructor(private nuclearnetClient: NUClearNetClient) {
    super({
      objectMode: true,
    })
    nuclearnetClient.onPacket(this.onPacket)
    nuclearnetClient.onJoin(this.onJoin)
    nuclearnetClient.onLeave(this.onLeave)
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NUClearNetStream(nuclearnetClient)
  }

  push(event: StreamEvent | null): boolean {
    return super.push(event)
  }

  onPacket = (packet: NUClearNetPacket) => {
    this.push({ type: 'packet', packet })
  }

  onJoin = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_join', peer })
  }

  onLeave = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_leave', peer })
  }

  _read() {
    // TODO (Annable): Is an empty implementation fine?
    // Intentionally empty
  }

  // TODO (Annable): Automatically end when client disconnects?
  end() {
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
    return super.write(event);
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
