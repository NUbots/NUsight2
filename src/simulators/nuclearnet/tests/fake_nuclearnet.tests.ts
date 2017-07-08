import { FakeNUClearNetClient } from '../../../server/nuclearnet/fake_nuclearnet_client'
import { FakeNUClearNetServer } from '../../../server/nuclearnet/fake_nuclearnet_server'
import { NUClearNetClient } from '../../../shared/nuclearnet/nuclearnet_client'
import { FakeNUClearNet } from '../fake_nuclearnet'

describe('FakeNUClearNet', () => {
  let server: FakeNUClearNetServer
  let alice: NUClearNetClient
  let bob: NUClearNetClient
  let eve: NUClearNetClient

  beforeEach(() => {
    server = new FakeNUClearNetServer()
    alice = new FakeNUClearNetClient(server)
    bob = new FakeNUClearNetClient(server)
    eve = new FakeNUClearNetClient(server)
  })

  it('calls nuclear_join event handlers on connect', () => {
    alice.connect({ name: 'alice' })
    eve.connect({ name: 'eve' })

    const aliceOnJoin = jest.fn()
    alice.onJoin(aliceOnJoin)

    const eveOnJoin = jest.fn()
    eve.onJoin(eveOnJoin)

    const bobOnJoin = jest.fn()
    bob.onJoin(bobOnJoin)

    bob.connect({ name: 'bob' })

    const expectedPeer = expect.objectContaining({ name: 'bob' })

    expect(aliceOnJoin).toHaveBeenCalledWith(expectedPeer)
    expect(eveOnJoin).toHaveBeenCalledWith(expectedPeer)
    expect(bobOnJoin).not.toHaveBeenCalled()
  })

  it('calls nuclear_leave event handlers on disconnect', () => {
    alice.connect({ name: 'alice' })
    eve.connect({ name: 'eve' })

    const aliceOnLeave = jest.fn()
    alice.onLeave(aliceOnLeave)

    const eveOnLeave = jest.fn()
    eve.onLeave(eveOnLeave)

    const bobOnLeave = jest.fn()
    bob.onLeave(bobOnLeave)

    const bobDisconnect = bob.connect({ name: 'bob' })

    const expectedPeer = expect.objectContaining({ name: 'bob' })

    bobDisconnect()

    expect(aliceOnLeave).toHaveBeenCalledWith(expectedPeer)
    expect(eveOnLeave).toHaveBeenCalledWith(expectedPeer)
    expect(bobOnLeave).not.toHaveBeenCalled()
  })

  it('sends messages to others', () => {
    alice.connect({ name: 'alice' })
    eve.connect({ name: 'eve' })
    bob.connect({ name: 'bob' })

    const aliceOnFoo = jest.fn()
    alice.on('foo', aliceOnFoo)

    const eveOnFoo = jest.fn()
    eve.on('foo', eveOnFoo)

    const bobOnFoo = jest.fn()
    bob.on('foo', bobOnFoo)

    const payload = new Buffer(8)
    bob.send({ type: 'foo', payload })

    const expectedPacket = {
      payload,
      peer: expect.objectContaining({ name: 'bob' }),
    }

    expect(aliceOnFoo).toHaveBeenCalledWith(expectedPacket)
    expect(eveOnFoo).toHaveBeenCalledWith(expectedPacket)
    expect(bobOnFoo).toHaveBeenCalledWith(expectedPacket)
  })
})
