import { WriteStream } from 'fs'
import * as fs from 'fs'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { createGzip } from 'zlib'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../../shared/time/clock'
import { NodeSystemClock } from '../time/node_clock'
import { packetToFrame } from './nbs_frame_codecs'
import { NbsFrameEncoder } from './nbs_frame_streams'

export class NbsRecorderController {
  private frameEncoder: NbsFrameEncoder
  private recording: boolean
  private file: WriteStream

  public constructor(private peer: NUClearNetPeer,
                     private clock: Clock,
                     private nuclearnetClient: NUClearNetClient) {
    this.recording = false
  }

  public static of(peer: NUClearNetPeer, nuclearnetClient: NUClearNetClient): NbsRecorderController {
    return new NbsRecorderController(peer, NodeSystemClock, nuclearnetClient)
  }

  public record(filename: string): () => void {
    this.frameEncoder = NbsFrameEncoder.of()
    this.file = fs.createWriteStream(filename, { defaultEncoding: 'binary' })
    const stopListening = this.nuclearnetClient.onPacket(this.onPacket)
    this.frameEncoder.pipe(createGzip()).pipe(this.file)
    this.recording = true
    return () => {
      stopListening()
      this.recording = false
      this.file.end()
    }
  }

  private onPacket = (packet: NUClearNetPacket) => {
    if (!this.arePeersEqual(this.peer, packet.peer)) {
      return
    }

    this.frameEncoder.write(packetToFrame(packet, this.clock.now()))
  }

  private arePeersEqual(peerA: NUClearNetPeer, peerB: NUClearNetPeer) {
    return peerA.name === peerB.name && peerA.address === peerB.address && peerA.port === peerB.port
  }
}
