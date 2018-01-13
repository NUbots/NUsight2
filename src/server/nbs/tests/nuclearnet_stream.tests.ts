import { FakeNUClearNetClient } from '../../nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../../nuclearnet/fake_nuclearnet_server'
import { NUClearNetStream } from '../nuclearnet_stream'

describe('NUClearNetStream', () => {
  let nuclearnetServer: FakeNUClearNetServer
  let nuclearnetClient: FakeNUClearNetClient
  let stream: NUClearNetStream

  beforeEach(() => {
    nuclearnetServer = new FakeNUClearNetServer()
    nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    stream = NUClearNetStream.of(nuclearnetClient)
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
      expect(spy).toHaveBeenCalledWith({ event: 'packet', packet })
      done()
    })
    nuclearnetClient.connect({ name: 'bob' })
    nuclearnetClient.fakePacket('hash', packet)
    stream.end()
  })
})
