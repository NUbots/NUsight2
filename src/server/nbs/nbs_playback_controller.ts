import * as fs from 'fs'
import { ReadStream } from 'fs'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { NbsNUClearPlayback } from './nbs_nuclear_playback'
import WritableStream = NodeJS.WritableStream

export class NbsPlaybackController {
  private state: PlaybackState
  private inputStream?: ReadStream
  private outputStream: WritableStream
  private currentIndex: number

  public constructor(private nuclearnetClient: NUClearNetClient) {
    this.state = PlaybackState.Idle
    this.currentIndex = 0
  }

  public static of(nuclearnetClient: NUClearNetClient) {
    return new NbsPlaybackController(nuclearnetClient)
  }

  public play(filename: string): () => void {
    this.state = PlaybackState.Playing

    this.inputStream = fs.createReadStream(filename, { encoding: 'binary' })
    this.outputStream = NbsNUClearPlayback.fromRawStream(this.inputStream, this.nuclearnetClient)
      .on('finish', () => {
        this.state = PlaybackState.Idle
      })

    return () => {
      if (this.inputStream) {
        this.state = PlaybackState.Idle
        this.inputStream.close()
        this.inputStream = undefined
      }
    }
  }

  public pause(): () => void {
    if (this.inputStream) {
      this.state = PlaybackState.Paused
      this.inputStream.pause()
    }
    return () => {
      if (this.inputStream && this.state === PlaybackState.Paused) {
        this.state = PlaybackState.Playing
        this.inputStream.resume()
      }
    }
  }
}

enum PlaybackState {
  Idle = 1,
  Paused,
  Playing,
}
