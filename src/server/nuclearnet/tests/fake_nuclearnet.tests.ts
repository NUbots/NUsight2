import { FakeNUClearNetServer } from '../fake_nuclearnet_server'
import { FakeNUClearNetClient } from '../fake_nuclearnet_client'

describe('FakeNUClearNet', () => {
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

  it('All connected clients receive join events for each other', () => {
    const bobOnJoin = jest.fn()
    bob.onJoin(bobOnJoin)
    bob.connect({ name: 'bob'})

    const aliceOnJoin = jest.fn()
    alice.onJoin(aliceOnJoin)
    alice.connect({ name: 'alice'})

    const eveOnJoin = jest.fn()
    eve.onJoin(eveOnJoin)
    eve.connect({ name: 'eve'})

    expect(bobOnJoin).toHaveBeenCalledTimes(3)
    expect(bobOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))
    expect(bobOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'alice' }))
    expect(bobOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'eve' }))

    expect(aliceOnJoin).toHaveBeenCalledTimes(3)
    expect(aliceOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))
    expect(aliceOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'alice' }))
    expect(aliceOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'eve' }))

    expect(eveOnJoin).toHaveBeenCalledTimes(3)
    expect(eveOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))
    expect(eveOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'alice' }))
    expect(eveOnJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'eve' }))
  })
})
