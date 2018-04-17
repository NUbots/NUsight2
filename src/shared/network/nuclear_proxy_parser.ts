import * as Emitter from 'component-emitter'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'

enum TYPES {
  CONNECT = 0,
  DISCONNECT = 1,
  EVENT = 2,
  ACK = 3,
  ERROR = 4,
  BINARY_EVENT = 5,
  BINARY_ACK = 6,
}

export class Encoder {

  encode(packet: any, callback: (packets: any) => void) {
    switch (packet.type) {
      case TYPES.EVENT:

        const { data: [eventName, eventData] } = packet

        switch (eventName) {

            // For our communication layer we can just use JSON
          case 'nuclear_join':
          case 'nuclear_leave':
          case 'nuclear_connect':
          case 'nuclear_disconnect':
          case 'listen':
          case 'unlisten':
            return callback([JSON.stringify(packet)])

            // For NUClearNet packets, we send the payload separately to avoid array slicing later
          default:
            const { id, data: [key, { peer, hash, payload, reliable }] } = packet

              // Send the header as a JSON and then the payload as binary
            return callback([
              JSON.stringify({ id, key, header: { peer, hash, reliable } }),
              payload,
            ])
        }
      default:
        return callback([JSON.stringify(packet)])
    }
  }
}

export class Decoder extends Emitter {

  private id?: number
  private key?: string
  private packet?: Partial<NUClearNetPacket>

  add(obj: any) {

    // Strings are json
    if (typeof obj === 'string') {
      const parsed = JSON.parse(obj)

      // Parsed type exists on all the non NUClearNet packets
      if (parsed.type !== undefined) {
        // This was a jsonified packet
        this.emit('decoded', JSON.parse(obj))
      } else {
        // This is a binary packet header
        this.key = parsed.key
        this.id = parsed.id
        this.packet = parsed.header
        this.packet!.payload = undefined
      }
    } else {
      // Things that are not strings are nuclearnet payloads
      this.packet!.payload = obj
      this.emit('decoded', {
        type: TYPES.EVENT,
        id: this.id,
        nsp: '/',
        data: [
          this.key,
          this.packet,
        ],
      })
    }
  }

  destroy() {
    this.key = undefined
    this.packet = undefined
    this.id = undefined
  }
}
