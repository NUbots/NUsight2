import * as fs from 'fs'
import * as minimist from 'minimist'

const HEADER = Buffer.from([0xE2, 0x98, 0xA2])
const HEADER_SIZE = HEADER.byteLength
const REMAINING_LENGTH_SIZE = 4
const TIMESTAMP_SIZE = 8
const HASH_SIZE = 8

function main() {
  const args = minimist(process.argv.slice(2))
  const filename = args.filename
  const buffer = fs.readFileSync(filename)

  const packets = readPackets(buffer)
  const types = packets.reduce((map: Map<string, number>, packet) => {
    map.set(packet.hash, (map.get(packet.hash) || 0) + 1)
    return map
  }, new Map())

  console.log(`Num packets: ${packets.length}`)
  console.log('Types:')
  console.log(Array.from(types.entries()).map(([hash, occurances]) => `${hash} = ${occurances}`).join('\n'))
}

function readPackets(buffer: Buffer) {
  const packets = []
  let index = 0
  do {
    const packet = readPacket(buffer, index)
    packets.push(packet)
    index = packet.lastIndex
  } while (index < buffer.byteLength)
  return packets
}

function readPacket(buffer: Buffer, offset: number) {
  let index = findNextHeader(buffer, offset)
  // console.log(`Header found at index ${index}`)
  index += HEADER_SIZE

  const remainingByteLength = buffer.readUInt32LE(index)
  // console.log(`Remaining byte length: ${remainingByteLength}`)
  index += REMAINING_LENGTH_SIZE

  const timeHighByte = buffer.readUInt32LE(index)
  const timeLowByte = buffer.readUInt32LE(index + 4)
  const timestamp = timeHighByte + timeLowByte // TODO (Annable): actually convert
  // console.log(`Timestamp: ${timeHighByte} ${timeLowByte} ${timestamp}`)
  index += TIMESTAMP_SIZE

  const hash = buffer.slice(index, index + HASH_SIZE).toString('hex')
  // console.log(`Hash: ${hash}`)
  index += HASH_SIZE

  const payloadByteLength = remainingByteLength - TIMESTAMP_SIZE - HASH_SIZE
  // console.log(`Data exists: ${payloadByteLength} ${buffer.byteLength >= index + payloadByteLength}`)
  const payload = buffer.slice(index, payloadByteLength)
  index += payloadByteLength

  return { remainingByteLength, timestamp, hash, payloadByteLength, payload, lastIndex: index }
}

function findNextHeader(buffer: Buffer, offset: number) {
  for (var i = offset; i < buffer.byteLength; i++) {
    if (buffer[i] === HEADER[0] && buffer[i + 1] === HEADER[1] && buffer[i + 2] === HEADER[2]) {
      return i
    }
  }
  return -1
}

if (require.main === module) {
  main()
}
