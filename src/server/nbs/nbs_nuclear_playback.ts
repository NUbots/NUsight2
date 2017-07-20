import { ReadStream } from 'fs'
import * as fs from 'fs'
import * as stream from 'stream'
import { PassThrough } from 'stream'
import { createGunzip } from 'zlib'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../time/clock'
import { NodeSystemClock } from '../time/node_clock'
import { NbsFrameChunker } from './nbs_frame_chunker'
import { NbsFrame } from './nbs_frame_codecs'
import { NbsFrameDecoder } from './nbs_frame_streams'

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

  public static fromFile(filename: string, nuclearnetClient: NUClearNetClient) {
    const playback = NbsNUClearPlayback.of(nuclearnetClient)
    let rawStream = fs.createReadStream(filename)
    const isGzipped = filename.endsWith('.nbz') || filename.endsWith('.nbs.gz')
    const decompress = isGzipped ? createGunzip() : new PassThrough()
    rawStream.pipe(decompress).pipe(new NbsFrameChunker()).pipe(new NbsFrameDecoder()).pipe(playback)
    return playback
  }

  public static fromRawStream(rawStream: ReadStream, nuclearnetClient: NUClearNetClient) {
    const playback = NbsNUClearPlayback.of(nuclearnetClient)
    rawStream.pipe(new NbsFrameChunker()).pipe(new NbsFrameDecoder()).pipe(playback)
    return playback
  }

  public _write(frame: NbsFrame, encoding: string, done: Function) {
    const now = this.clock.performanceNow()
    if (this.firstFrameTimestamp === undefined || this.firstLocalTimestamp === undefined) {
      this.firstFrameTimestamp = frame.timestampInMicroseconds
      this.firstLocalTimestamp = now
    }

    const timeOffset = (frame.timestampInMicroseconds - this.firstFrameTimestamp) * 1e-6
    const timeout = Math.max(0, this.firstLocalTimestamp + timeOffset - now)

    this.clock.setTimeout(() => {
      this.nuclearnetClient.send({
        type: frame.hash,
        payload: frame.payload,
      })
      done()
    }, timeout)
  }
}
