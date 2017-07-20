import * as stream from 'stream'
import { NbsFrame } from './nbs_frame_codecs'
import { encodeFrame } from './nbs_frame_codecs'
import { decodeFrame } from './nbs_frame_codecs'

export class NbsFrameEncoder extends stream.Transform {
  public constructor() {
    super({
      objectMode: true,
    })
  }

  public static of() {
    return new NbsFrameEncoder()
  }

  public _transform(frame: NbsFrame, encoding: string, done: (err?: any, data?: any) => void) {
    this.push(encodeFrame(frame))
    done()
  }
}

export class NbsFrameDecoder extends stream.Transform {
  public constructor() {
    super({
      objectMode: true,
    })
  }

  public static of() {
    return new NbsFrameDecoder()
  }

  public _transform(buffer: Buffer, encoding: string, done: (err?: any, data?: any) => void) {
    this.push(decodeFrame(buffer))
    done()
  }
}
