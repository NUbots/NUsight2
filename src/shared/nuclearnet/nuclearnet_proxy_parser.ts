import * as Emitter from 'component-emitter'
import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'

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
              JSON.stringify({ id, key, header: { peer, reliable } }),
              hash,
              payload,
            ])
        }
      default:
        return callback([JSON.stringify(packet)])
    }
  }
}

export class Decoder extends Emitter {

  private state: number = 0
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
        this.state = 1
      }
    } else {
      switch (this.state) {
        // State 1 means we are getting a hash
        case 1:
          this.packet!.hash = obj
          this.state = 2
          break

        // State 2 means we are getting a packet
        case 2:
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
  }
}
