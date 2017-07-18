import { ReadStream } from 'fs'
import * as stream from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../time/clock'
import { NodeSystemClock } from '../time/node_clock'
import { NbsFrameChunker } from './nbs_frame_chunker'
import { NbsFrame } from './nbs_frame_codecs'
import { NbsFrameDecoder } from './nbs_frame_codecs'

export class NbsNUClearPlayback extends stream.Writable {
  private firstFrameTimestamp?: number
  private firstLocalTimestamp?: number

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private clock: Clock) {
    super({
      objectMode: true,
    })
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NbsNUClearPlayback(nuclearnetClient, NodeSystemClock)
  }

  public static fromRawStream(rawStream: ReadStream, nuclearnetClient: NUClearNetClient) {
    const playback = NbsNUClearPlayback.of(nuclearnetClient)
    rawStream.pipe(new NbsFrameChunker()).pipe(new NbsFrameDecoder()).pipe(playback)
    return playback
  }

  public _write(frame: NbsFrame, encoding: string, done: Function) {
    if (this.firstFrameTimestamp === undefined || this.firstLocalTimestamp === undefined) {
      this.firstFrameTimestamp = frame.timestamp
      this.firstLocalTimestamp = this.clock.performanceNow()
    }
    const now = this.clock.performanceNow()
    const timeOffset = frame.timestamp - this.firstFrameTimestamp
    const timeout = this.firstLocalTimestamp + timeOffset - now
    this.clock.setTimeout(() => {
      this.nuclearnetClient.send({
        type: frame.hash,
        payload: frame.payload,
      })
      done()
    }, timeout)
  }
}
