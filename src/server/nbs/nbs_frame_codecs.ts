import * as Long from 'long'
import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { Clock } from '../time/clock'
import { NodeSystemClock } from '../time/node_clock'

export type NbsFrame = {
  header: Buffer
  size: number
  timestamp: number,
  hash: Buffer,
  payload: Buffer,
}

export const NBS_HEADER = Buffer.from([0xE2, 0x98, 0xA2]) // NUClear radiation symbol.

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

// NBS frame format:
// 3 Bytes - NUClear radiation symbol header, useful for synchronisation when attaching to an existing stream.
// 4 Bytes - The remaining packet length i.e. 16 bytes + N payload bytes
// 8 Bytes - 64bit timestamp in microseconds. Note: this is not necessarily a unix timestamp.
// 8 Bytes - 64bit bit hash of the message type.
// N bytes - The binary packet payload.

export function encodeFrame(frame: NbsFrame): Buffer {
  const buffer = new Buffer(7 + frame.size)
  NBS_HEADER.copy(buffer)
  buffer.writeUInt32LE(frame.size, 3)
  const timeLong = Long.fromNumber(frame.timestamp)
  buffer.writeUInt32LE(timeLong.low, 7)
  buffer.writeUInt32LE(timeLong.high, 11)
  frame.hash.copy(buffer, 15)
  frame.payload.copy(buffer, 23)
  return buffer
}

export function decodeFrame(buffer: Buffer): NbsFrame {
  const header = buffer.slice(0, 3)
  const size = buffer.readUInt32LE(3)
  const timestamp = Long.fromBits(buffer.readUInt32LE(7), buffer.readUInt32LE(11)).toNumber()
  const hash = buffer.slice(15, 23)
  const payload = buffer.slice(23)
  return { header, size, timestamp, hash, payload }
}

export function packetToFrame(packet: NUClearNetPacket, timestamp: number): NbsFrame {
  return {
    header: Buffer.from(NBS_HEADER),
    size: packet.payload.byteLength + 16,
    timestamp,
    hash: packet.hash,
    payload: packet.payload,
  }
}
