import { FakeNUClearNetServer } from '../fake_nuclearnet_server'
import { FakeNUClearNetClient } from '../fake_nuclearnet_client'

describe('FakeNUClearNetClient', () => {
  let server: FakeNUClearNetServer
  let bob: FakeNUClearNetClient
  let alice: FakeNUClearNetClient
  let eve: FakeNUClearNetClient

  beforeEach(() => {
    server = new FakeNUClearNetServer()
    bob = new FakeNUClearNetClient(server)
    alice = new FakeNUClearNetClient(server)
    eve = new FakeNUClearNetClient(server)
  })

  it('receives own join event', () => {
    const onJoin = jest.fn()
    bob.onJoin(onJoin)

    bob.connect({ name: 'bob' })

    expect(onJoin).toHaveBeenCalledTimes(1)
    expect(onJoin).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'bob' }))
  })

  it('does not receive own leave event', () => {
    const onLeave = jest.fn()
    bob.onLeave(onLeave)

    const disconnect = bob.connect({ name: 'bob' })
    disconnect()

    expect(onLeave).not.toHaveBeenCalled()
  })

  it('receives join events from other clients', () => {
    bob.connect({ name: 'bob' })
    alice.connect({ name: 'alice' })

    const bobOnJoin = jest.fn()
    bob.onJoin(bobOnJoin)

    const aliceOnJoin = jest.fn()
    alice.onJoin(aliceOnJoin)

    eve.connect({ name: 'eve' })

    expect(bobOnJoin).toHaveBeenCalledTimes(1)
    expect(bobOnJoin).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'eve' }))

    expect(aliceOnJoin).toHaveBeenCalledTimes(1)
    expect(aliceOnJoin).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'eve' }))
  })

  it('receives leave events from other clients', () => {
    bob.connect({ name: 'bob' })
    alice.connect({ name: 'alice' })

    const bobOnLeave = jest.fn()
    bob.onLeave(bobOnLeave)

    const aliceOnLeave = jest.fn()
    alice.onLeave(aliceOnLeave)

    const disconnectEve = eve.connect({ name: 'eve' })
    disconnectEve()

    expect(bobOnLeave).toHaveBeenCalledTimes(1)
    expect(bobOnLeave).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'eve' }))

    expect(aliceOnLeave).toHaveBeenCalledTimes(1)
    expect(aliceOnLeave).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'eve' }))
  })

  it('receives join events for all other connected clients on connect', () => {
    bob.connect({ name: 'bob' })
    alice.connect({ name: 'alice' })

    const onJoin = jest.fn()
    eve.onJoin(onJoin)
    eve.connect({ name: 'eve' })

    expect(onJoin).toHaveBeenCalledTimes(3)
    expect(onJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))
    expect(onJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'alice' }))
    expect(onJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'eve' }))
  })

  it('does not receive own messages', () => {
    bob.connect({ name: 'bob' })

    const onSensors = jest.fn()
    bob.on('sensors', onSensors)

    const payload = new Buffer(8)
    bob.send({ type: 'sensors', payload })

    expect(onSensors).toHaveBeenCalledTimes(0)
  })

  it('receives messages sent from other clients', () => {
    bob.connect({ name: 'bob' })
    alice.connect({ name: 'alice' })
    eve.connect({ name: 'eve' })

    const bobOnSensors = jest.fn()
    bob.on('sensors', bobOnSensors)

    const aliceOnSensors = jest.fn()
    bob.on('sensors', aliceOnSensors)

    const eveOnSensors = jest.fn()
    eve.on('sensors', eveOnSensors)

    const payload = new Buffer(8)
    eve.send({ type: 'sensors', payload })

    expect(bobOnSensors).toHaveBeenCalledTimes(1)
    expect(bobOnSensors).toHaveBeenLastCalledWith({ payload, peer: expect.objectContaining({ name: 'eve' }) })

    expect(aliceOnSensors).toHaveBeenCalledTimes(1)
    expect(aliceOnSensors).toHaveBeenLastCalledWith({ payload, peer: expect.objectContaining({ name: 'eve' }) })

    expect(eveOnSensors).toHaveBeenCalledTimes(0)
  })
})
