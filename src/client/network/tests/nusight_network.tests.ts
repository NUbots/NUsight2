import { FakeNUClearNetClient } from '../../../server/nuclearnet/fake_nuclearnet_client'
import { createMockInstance } from '../../../shared/base/testing/create_mock_instance'
import { message } from '../../../shared/proto/messages'
import { NUsightNetwork } from '../nusight_network'
import { MessageTypePath } from '../message_type_names'
import Socket = SocketIOClient.Socket
import Sensors = message.input.Sensors
import Mocked = jest.Mocked

describe('NUsightNetwork', () => {
  let network: NUsightNetwork
  let mockedNUClearNetClient: Mocked<FakeNUClearNetClient>
  let mockedMessageTypePath: Mocked<MessageTypePath>

  beforeEach(() => {
    mockedNUClearNetClient = createMockInstance(FakeNUClearNetClient)
    mockedMessageTypePath = createMockInstance(MessageTypePath)
    mockedMessageTypePath.getPath.mockReturnValue('message.input.Sensors')
    network = new NUsightNetwork(mockedNUClearNetClient, mockedMessageTypePath)
  })

  describe('event handling', () => {
    it('starts listening event', () => {
      network.onNUClearMessage(Sensors, jest.fn())
      expect(mockedNUClearNetClient.on).toHaveBeenCalledWith('NUsight<message.input.Sensors>', expect.any(Function))
    })

    it('stops listening to event', () => {
      const cb = jest.fn()
      mockedNUClearNetClient.on.mockReturnValue(cb)
      const off = network.onNUClearMessage(Sensors, jest.fn())

      off()
      expect(cb).toHaveBeenCalled()
    })

    // it('only sends listening event once', () => {
    //   network.onNUClearMessage(Sensors, jest.fn())
    //   network.onNUClearMessage(Sensors, jest.fn())
    //   expect(mockedNUClearNetClient.on).toHaveBeenCalledTimes(1)
    // })

    // it('stops listening to type after all listeners have unsubscribed', () => {
    //   const cb1 = jest.fn()
    //   const cb2 = jest.fn()
    //   network.on(Sensors, cb1)
    //   network.on(Sensors, cb2)
    //
    //   network.off(Sensors, cb1)
    //   expect(mockedRawSocket.unlisten).not.toHaveBeenCalled()
    //
    //   network.off(Sensors, cb2)
    //   expect(mockedRawSocket.unlisten).toHaveBeenLastCalledWith('message.input.Sensors')
    // })
  })
})
