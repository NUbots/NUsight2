import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'

type StreamEvent = StreamPacket | StreamJoinEvent | StreamLeaveEvent

type StreamPacket = { type: 'packet', packet: NUClearNetPacket }
type StreamJoinEvent = { type: 'nuclear_join', peer: NUClearNetPeer }
type StreamLeaveEvent = { type: 'nuclear_leave', peer: NUClearNetPeer }

export class NUClearNetStream extends stream.Duplex {
  constructor(private nuclearnetClient: NUClearNetClient) {
    super({
      objectMode: true,
    })
    nuclearnetClient.onPacket(this.onPacket);
    nuclearnetClient.onJoin(this.onJoin);
    nuclearnetClient.onLeave(this.onLeave);
  }

  push(event: StreamEvent | null): boolean {
    return super.push(event);
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NUClearNetStream(nuclearnetClient)
  }

  onPacket = (packet: NUClearNetPacket) => {
    this.push({ type: 'packet', packet });
  }

  onJoin = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_join', peer })
  }

  onLeave = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_leave', peer })
  }

  _read() {
    // TODO (Annable): Is an empty implementation fine?
  }

  // TODO (Annable): Automatically end when client disconnects?
  end() {
    this.push(null);
  }
}
