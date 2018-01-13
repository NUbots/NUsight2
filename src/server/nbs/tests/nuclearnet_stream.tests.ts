import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { PassThrough } from 'stream'
import { range } from '../../../shared/base/range'
import { FakeNUClearNetClient } from '../../nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../../nuclearnet/fake_nuclearnet_server'
import { StreamPacket } from '../nuclearnet_stream'
import { PeerFilter } from '../nuclearnet_stream'
import { NUClearNetStream } from '../nuclearnet_stream'

describe('NUClearNetStream', () => {
  const highWaterMark = 10
  let nuclearnetServer: FakeNUClearNetServer
  let nuclearnetClient: FakeNUClearNetClient
  let stream: NUClearNetStream

  beforeEach(() => {
    nuclearnetServer = new FakeNUClearNetServer()
    nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    stream = NUClearNetStream.of(nuclearnetClient, highWaterMark)
  })

  it('forwards join events into the stream', done => {
    const spy = jest.fn()
    stream.on('data', spy).on('end', () => {
      expect(spy).toHaveBeenCalledWith({
        type: 'nuclear_join', peer: expect.objectContaining({
          name: 'alice',
        }),
      })
      done()
    })
    nuclearnetClient.connect({ name: 'bob' })

    const aliceClient = new FakeNUClearNetClient(nuclearnetServer)
    aliceClient.connect({ name: 'alice' })

    stream.end()
  })

  it('forwards leave events into the stream', done => {
    const spy = jest.fn()
    stream.on('data', spy).on('end', () => {
      expect(spy).toHaveBeenCalledWith({
        type: 'nuclear_leave', peer: expect.objectContaining({
          name: 'alice',
        }),
      })
      done()
    })
    nuclearnetClient.connect({ name: 'bob' })

    const aliceClient = new FakeNUClearNetClient(nuclearnetServer)
    const disconnect = aliceClient.connect({ name: 'alice' })
    disconnect()

    stream.end()
  })

  it('forwards packets into the stream', done => {
    const spy = jest.fn()
    const packet = {
      peer: { name: 'alice', address: 'fake_address', port: -1 },
      hash: new Buffer(8),
      payload: new Buffer(8),
      reliable: true,
    }
    stream.on('data', spy).on('end', () => {
      expect(spy).toHaveBeenCalledWith({ type: 'packet', packet })
      done()
    })
    nuclearnetClient.connect({ name: 'bob' })
    nuclearnetClient.fakePacket('hash', packet)
    stream.end()
  })

  describe('buffering', () => {
    let packet: NUClearNetPacket

    beforeEach(() => {
      packet = {
        peer: { name: 'alice', address: 'fake_address', port: -1 },
        hash: new Buffer(8),
        payload: new Buffer(8),
        reliable: true,
      }
      nuclearnetClient.connect({ name: 'bob' })
    })

    it('stops at highwatermark', done => {
      const spy = jest.fn()
      stream.on('data', spy).on('end', () => {
        expect(spy).toHaveBeenCalledTimes(highWaterMark)
        done()
      })
      range(highWaterMark + 10).forEach(() => {
        nuclearnetClient.fakePacket('hash', packet)
      })
      stream.end()
    })

    it('drains buffer when available', async done => {
      const slowReader = new PassThrough({ objectMode: true })
      const spy = jest.fn()

      slowReader.on('data', spy).on('end', () => {
        const packetEventCalls = spy.mock.calls.filter(call => call[0].type === 'packet')
        expect(packetEventCalls.length).toBe(100)
        packetEventCalls.forEach(call => {
          expect(call[0]).toMatchObject({ type: 'packet', packet })
        })
        done()
      })
      stream.pipe(slowReader)

      range(highWaterMark + 90).forEach(() => {
        nuclearnetClient.fakePacket('hash', packet)
      })

      await flush()

      stream.end()
    })
  })
})

const flush = () => new Promise(res => setImmediate(res))

describe('PeerFilter', () => {
  let peer: NUClearNetPeer
  let filter: PeerFilter

  beforeEach(() => {
    peer = { name: 'bob', address: 'fake_address', port: -1 }
    filter = PeerFilter.of(peer)
  })

  it('should forward through packets of given peer', done => {
    const spy = jest.fn()
    filter.on('data', spy).on('finish', () => {
      expect(spy).toHaveBeenCalled()
      done()
    })
    const event: StreamPacket = {
      type: 'packet',
      packet: {
        peer: { name: 'bob', address: 'fake_address', port: -1 },
        hash: new Buffer(8),
        payload: new Buffer(8),
        reliable: true,
      },
    }
    filter.write(event)
    filter.end()
  })

  it('should not forward through packets of other peers', done => {
    const spy = jest.fn()
    filter.on('data', spy).on('finish', () => {
      expect(spy).not.toHaveBeenCalled()
      done()
    })
    const event: StreamPacket = {
      type: 'packet',
      packet: {
        peer: { name: 'alice', address: 'fake_address', port: -1 },
        hash: new Buffer(8),
        payload: new Buffer(8),
        reliable: true,
      },
    }
    filter.write(event)
    filter.end()
  })
})
