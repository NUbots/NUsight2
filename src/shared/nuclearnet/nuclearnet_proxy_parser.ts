import * as Emitter from 'component-emitter'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import * as XXH from 'xxhashjs'

import { Packet } from './nuclearnet_proxy_parser_socketio'
import { TYPES } from './nuclearnet_proxy_parser_socketio'

/**
 * These encoder/decoders are used to improve the performance when transporting NUClearNet packets.
 * Most of these packets are composed of a few header fields and a large binary blob.
 * Other parsers such as the default one or msgpack parser do not do a good job of transporting these,
 * especially when they are large packets.
 * This is because in order to extract the data back into a usable format, msgpack must perform a buffer.slice()
 * to extract the bytes. If this is a large buffer, it causes a large memory copy that slows things down considerably.
 * The default one on the other hand does not handle binary data well.
 * This custom parser handles sending binary data much better as the resulting buffer is sent unmolested.
 * This means that at the other end that buffer can be directly used rather than slicing it.
 */

export class Encoder {

  encode(packet: Packet, callback: (wire: any[]) => void) {
    switch (packet.type) {
      case TYPES.EVENT:

        const { nsp, data: [eventName] } = packet

        switch (eventName) {
          // For our communication layer we can just use JSON
          case 'nuclear_join':
          case 'nuclear_leave':
          case 'nuclear_connect':
          case 'nuclear_disconnect':
          case 'listen':
          case 'unlisten':
            return callback([JSON.stringify(packet)])

          case 'packet': {
            const { id, data: [key, { target, type, payload, reliable }] } = packet
            return callback([
              JSON.stringify({ id, nsp, key, header: { target, type, reliable } }),
              hashType(type),
              payload,
            ])
          }

          // For NUClearNet packets, we send the payload separately to avoid array slicing later
          default: {
            const { id, data: [key, { peer, hash, payload, reliable }] } = packet

            // Send the header as a JSON and then the payload as binary
            return callback([
              JSON.stringify({ id, nsp, key, header: { peer, reliable } }),
              hash,
              payload,
            ])
          }
        }
      default:
        return callback([JSON.stringify(packet)])
    }
  }
}

export class Decoder extends Emitter {

  private state: number = 0
  private nuclearPacket?: {
    nsp: string,
    type: TYPES.EVENT,
    data: [string, Partial<NUClearNetPacket>],
    id: number
  }

  add(obj: any) {

    // Strings are json
    if (typeof obj === 'string') {
      const parsed = JSON.parse(obj)

      // Parsed type exists on all the non NUClearNet packets
      if (parsed.type !== undefined) {
        // This was a jsonified packet
        this.emit('decoded', JSON.parse(obj))
        this.state = 0
      } else {
        // This is a binary packet header
        this.nuclearPacket = {
          nsp: parsed.nsp,
          type: TYPES.EVENT,
          id: parsed.id,
          data: [parsed.key, parsed.header],
        }
        this.state = 1
      }
    } else {
      switch (this.state) {
        // State 1 means we are getting a hash
        case 1:
          this.nuclearPacket!.data[1].hash = obj
          this.state = 2
          break

        // State 2 means we are getting a packet
        case 2:
          this.nuclearPacket!.data[1].payload = obj
          this.emit('decoded', this.nuclearPacket)
          this.state = 0
          break

        // Something went wrong, reset
        default:
          this.state = 0
          break
      }
    }
  }

  destroy() {
    this.nuclearPacket = undefined
  }
}

export function hashType(type: string): Buffer {
  // Matches hashing implementation from NUClearNet
  // See https://goo.gl/6NDPo2
  let hashString: string = XXH.h64(type, 0x4e55436c).toString(16)
  // The hash string may truncate if it's smaller than 16 characters so we pad it with 0s
  hashString = ('0'.repeat(16) + hashString).slice(-16)

  return Buffer.from((hashString.match(/../g) as string[]).reverse().join(''), 'hex')
}
