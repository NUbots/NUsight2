import { NUClearNetPacket } from 'nuclearnet.js'

import { SeededRandom } from '../../../shared/base/random/seeded_random'
import { Encoder } from '../nuclearnet_proxy_parser'
import { Decoder } from '../nuclearnet_proxy_parser'
import { TYPES } from '../nuclearnet_proxy_parser_socketio'
import { Packet } from '../nuclearnet_proxy_parser_socketio'
import { EventPacket } from '../nuclearnet_proxy_parser_socketio'

describe('NUClearNetProxyParser', () => {

  let e: Encoder
  let d: Decoder
  let random: SeededRandom

  beforeEach(() => {
    e = new Encoder()
    d = new Decoder()
    random = SeededRandom.of('NUClearNetProxyParser')
  })

  function randomPacketId() {
    return random.integer(0, 1000)
  }

  function randomPort() {
    return random.integer(40000, 50000)
  }

  function randomEventId() {
    return random.integer(0, 1000)
  }

  it('Roundtrips regular socket.io packets', () => {

    const packets: Packet[] = [
      {
        nsp: '/',
        type: TYPES.CONNECT,
      },
      {
        nsp: '/',
        type: TYPES.DISCONNECT,
      },
      {
        nsp: '/',
        type: TYPES.ACK,
        data: [],
        id: randomPacketId(),
      },
      {
        nsp: '/',
        type: TYPES.ERROR,
        data: 'Oh no!',
      },
    ]

    // Encode all the packets
    const wire: any[] = []
    packets.forEach(p => e.encode(p, (chunks: any[]) => wire.push(...chunks)))

    // Decode all the packets
    const decoded: any[] = []
    d.on('decoded', (packet: any) => decoded.push(packet))
    wire.forEach(p => d.add(p))

    expect(decoded).toEqual(packets)
  })

  it('Roundtrips NUClearNet informational packets', () => {

    const packets: Packet[] = [
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_join', {
          name: 'itsnotme',
          address: '127.0.0.1',
          port: randomPort(),
        }],
        id: randomPacketId(),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_leave', {
          name: 'itsyou',
          address: '192.168.10.11',
          port: randomPort(),
        }],
        id: randomPacketId(),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_connect', {}],
        id: randomPacketId(),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_disconnect'],
        id: randomPacketId(),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['listen', 'message.input.Image', randomEventId()],
        id: randomPacketId(),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['unlisten', randomEventId()],
        id: randomPacketId(),
      },
    ]

    // Encode all the packets
    const wire: any[] = []
    packets.forEach(p => e.encode(p, (chunks: any[]) => wire.push(...chunks)))

    // Decode all the packets
    const decoded: any[] = []
    d.on('decoded', (packet: any) => decoded.push(packet))
    wire.forEach(p => d.add(p))

    expect(decoded).toEqual(packets)
  })

  it('Roundtrips NUClearNet packets with binary data in them', () => {

    // Encode an image protocol buffer as an example
    //
    const nuclearPackets: NUClearNetPacket[] = [
      {
        peer: {
          name: 'itshard',
          address: '192.168.2.11',
          port: randomPort(),
        },
        hash: Buffer.alloc(8),
        payload: Buffer.alloc(1000),
        reliable: true,
      },
      {
        peer: {
          name: 'tothinkupnames',
          address: '192.168.2.11',
          port: randomPort(),
        },
        hash: Buffer.alloc(8),
        payload: Buffer.alloc(1000),
        reliable: true,
      },
    ]

    const packets: Packet[] = nuclearPackets.map((p): EventPacket => (
    {
      nsp: '/',
      type: TYPES.EVENT,
      data: ['message.input.Image', p],
      id: randomPacketId(),
    }
    ))

    // Encode all the packets
    const wire: any[] = []
    packets.forEach(p => e.encode(p, (chunks: any[]) => wire.push(...chunks)))

    // Decode all the packets
    const decoded: any[] = []
    d.on('decoded', (packet: any) => decoded.push(packet))
    wire.forEach(p => d.add(p))

    expect(wire).toHaveLength(packets.length * 3)

    expect(wire[1]).toBeInstanceOf(Buffer)
    expect(wire[2]).toBeInstanceOf(Buffer)
    expect(wire[4]).toBeInstanceOf(Buffer)
    expect(wire[5]).toBeInstanceOf(Buffer)

    expect(decoded).toEqual(packets)
  })
})
