import * as Long from 'long'
import { NUClearNetPacket } from 'nuclearnet.js'

export const NBS_HEADER = Buffer.from([0xE2, 0x98, 0xA2]) // NUClear radiation symbol.

export type NbsFrame = {
  // Omitted redundant header information.
  // header: Buffer,
  // size: number,
  timestampInMicroseconds: number,
  hash: Buffer,
  payload: Buffer,
}

// NBS frame format:
// 3 Bytes - NUClear radiation symbol header, useful for synchronisation when attaching to an existing stream.
// 4 Bytes - The remaining packet length i.e. 16 bytes + N payload bytes
// 8 Bytes - 64bit timestamp in microseconds. Note: this is not necessarily a unix timestamp.
// 8 Bytes - 64bit bit hash of the message type.
// N bytes - The binary packet payload.

export function encodeFrame(frame: NbsFrame): Buffer {
  const size = 16 + frame.payload.byteLength
  const buffer = new Buffer(7 + size)
  NBS_HEADER.copy(buffer, 0, 0, 3)
  buffer.writeUInt32LE(size, 3)
  const timeLong = Long.fromNumber(frame.timestampInMicroseconds)
  buffer.writeUInt32LE(timeLong.low, 7)
  buffer.writeUInt32LE(timeLong.high, 11)
  frame.hash.copy(buffer, 15, 0, 8)
  frame.payload.copy(buffer, 23)
  return buffer
}

export function decodeFrame(buffer: Buffer): NbsFrame {
  const size = buffer.readUInt32LE(3)
  const timestampInMicroseconds = Long.fromBits(buffer.readUInt32LE(7), buffer.readUInt32LE(11)).toNumber()
  const hash = buffer.slice(15, 23)
  const payload = buffer.slice(23, 23 + size)
  return { timestampInMicroseconds, hash, payload }
}

export function packetToFrame(packet: NUClearNetPacket, timestamp: number): NbsFrame {
  return {
    timestampInMicroseconds: timestamp * 1e6,
    hash: packet.hash,
    payload: packet.payload,
  }
}
