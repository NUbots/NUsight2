import * as stream from 'stream'
import { Clock } from '../time/clock'
import { NodeSystemClock } from '../time/node_clock'
import { NbsFrame } from './nbs_frame_codecs'
import { encodeFrame } from './nbs_frame_codecs'
import { NUClearNetPacket } from 'nuclearnet.js'
import { packetToFrame } from './nbs_frame_codecs'
import { decodeFrame } from './nbs_frame_codecs'

export class NbsFrameEncoder extends stream.Transform {
  public constructor(private clock: Clock) {
    super({
      objectMode: true,
    })
  }

  public static of() {
    return new NbsFrameEncoder(NodeSystemClock)
  }

  public _transform(frame: NbsFrame, encoding: string, done: (err?: any, data?: any) => void) {
    this.push(encodeFrame(frame))
    done()
  }

  public writePacket(packet: NUClearNetPacket) {
    this.write(packetToFrame(packet, this.clock.performanceNow()))
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
