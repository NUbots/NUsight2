import { FakeNUClearNetServer } from '../fake_nuclearnet_server'
import { createMockInstance } from '../../../shared/base/testing/create_mock_instance'
import { FakeNUClearNetClient } from '../fake_nuclearnet_client'
import Mocked = jest.Mocked
import MockInstance = jest.MockInstance
import { NUClearNetPeer } from 'nuclearnet.js'

describe.skip('FakeNUClearNetServer', () => {
  let server: FakeNUClearNetServer

  beforeEach(() => {
    server = new FakeNUClearNetServer()
  })

  it('sends nuclear_join events to new peers for all existing peers', () => {
    // TODO (Annable): Make FakeNUClearNetClient reasonable to mock and avoid the casting.
    const bob: Mocked<FakeNUClearNetClient> = createMockInstance(FakeNUClearNetClient)
    bob.peer = {
      name: 'bob',
      address: '127.0.0.1',
      port: 7447,
    } as any as NUClearNetPeer & MockInstance<NUClearNetPeer>
    server.connect(bob)

    const alice: Mocked<FakeNUClearNetClient> = createMockInstance(FakeNUClearNetClient)
    alice.peer = {
      name: 'alice',
      address: '127.0.0.1',
      port: 7447,
    } as any as NUClearNetPeer & MockInstance<NUClearNetPeer>
    server.connect(alice)

    const eve: Mocked<FakeNUClearNetClient> = createMockInstance(FakeNUClearNetClient)
    eve.peer = {
      name: 'eve',
      address: '127.0.0.1',
      port: 7447,
    } as any as NUClearNetPeer & MockInstance<NUClearNetPeer>
    server.connect(eve)

    expect(bob.fakeJoin).toHaveBeenCalledTimes(1)
    expect(bob.fakeJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))

    expect(alice.fakeJoin).toHaveBeenCalledTimes(2)
    expect(alice.fakeJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))
    expect(alice.fakeJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'alice' }))

    expect(eve.fakeJoin).toHaveBeenCalledTimes(3)
    expect(eve.fakeJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'bob' }))
    expect(eve.fakeJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'alice' }))
    expect(eve.fakeJoin).toHaveBeenCalledWith(expect.objectContaining({ name: 'eve' }))
  })
})
