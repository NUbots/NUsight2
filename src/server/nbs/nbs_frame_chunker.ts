import * as Buffers from 'buffers'
import * as stream from 'stream'
import { NBS_HEADER } from './nbs_frame_codecs'

export class NbsFrameChunker extends stream.Transform {
  private buffers: Buffers
  private foundHeader: boolean
  private foundPacketSize: boolean

  constructor() {
    super({
      objectMode: true,
    })

    this.buffers = new Buffers()
    this.foundHeader = false
    this.foundPacketSize = false
  }

  public static of(): NbsFrameChunker {
    return new NbsFrameChunker()
  }

  public _transform(chunk: any, encoding: string, done: (err?: any, data?: any) => void) {
    this.buffers.push(chunk)

    let frame
    while ((frame = this.getNextFrame(this.buffers)) !== undefined) {
      this.push(frame.buffer)
      this.buffers.splice(0, frame.offset + frame.buffer.byteLength)
    }

    done()
  }

  private getNextFrame(buffer: Buffers): { offset: number, buffer: Buffer } | undefined {
    const headerIndex = buffer.indexOf(NBS_HEADER)
    const headerSize = NBS_HEADER.byteLength
    const packetLengthSize = 4
    const headerAndPacketLengthSize = headerSize + packetLengthSize
    if (headerIndex >= 0) {
      const frame = buffer.slice(headerIndex)
      if (frame.length >= headerAndPacketLengthSize) {
        const packetSize = frame.slice(headerSize, headerSize + headerAndPacketLengthSize).readUInt32LE(0)
        if (frame.length >= headerAndPacketLengthSize + packetSize) {
          return {
            offset: headerIndex,
            buffer: frame.slice(0, headerAndPacketLengthSize + packetSize),
          }
        }
      }
    }
    return undefined
  }
}
