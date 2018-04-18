import { NUClearNetPacket } from 'nuclearnet.js'

import { Encoder } from '../nuclearnet_proxy_parser'
import { Decoder } from '../nuclearnet_proxy_parser'
import { TYPES } from '../nuclearnet_proxy_parser_socketio'
import { Packet } from '../nuclearnet_proxy_parser_socketio'
import { EventPacket } from '../nuclearnet_proxy_parser_socketio'

describe('NUClearNetProxyParser', () => {

  let e: Encoder
  let d: Decoder

  beforeEach(() => {
    e = new Encoder()
    d = new Decoder()
  })

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
        id: Math.floor(Math.random() * 1000),
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
          port: 40000 + Math.floor(Math.random() * 10000),
        }],
        id: Math.floor(Math.random() * 1000),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_leave', {
          name: 'itsyou',
          address: '192.168.10.11',
          port: 40000 + Math.floor(Math.random() * 10000),
        }],
        id: Math.floor(Math.random() * 1000),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_connect', {}],
        id: Math.floor(Math.random() * 1000),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['nuclear_disconnect'],
        id: Math.floor(Math.random() * 1000),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['listen', 'message.input.Image', Math.floor(Math.random() * 1000)],
        id: Math.floor(Math.random() * 1000),
      },
      {
        nsp: '/',
        type: TYPES.EVENT,
        data: ['unlisten', Math.floor(Math.random() * 1000)],
        id: Math.floor(Math.random() * 1000),
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
          port: 40000 + Math.floor(Math.random() * 10000),
        },
        hash: new Buffer(8),
        payload: new Buffer(1000),
        reliable: true,
      },
      {
        peer: {
          name: 'tothinkupnames',
          address: '192.168.2.11',
          port: 40000 + Math.floor(Math.random() * 10000),
        },
        hash: new Buffer(8),
        payload: new Buffer(1000),
        reliable: true,
      },
    ]

    const packets: Packet[] = nuclearPackets.map((p): EventPacket => (
    {
      nsp: '/',
      type: TYPES.EVENT,
      data: ['message.input.Image', p],
      id: Math.floor(Math.random() * 1000),
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
