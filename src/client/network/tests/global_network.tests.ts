import { createMockInstance } from '../../../shared/base/testing/create_mock_instance'
import { message } from '../../../shared/proto/messages'
import { NUsightNetwork } from '../global_network'
import { RawSocket } from '../raw_socket'
import Socket = SocketIOClient.Socket
import Sensors = message.input.Sensors
import { MessageTypePath } from '../message_type_names'
import Mocked = jest.Mocked

describe('NUsightNetwork', () => {
  let network: NUsightNetwork
  let mockedRawSocket: Mocked<RawSocket>
  let mockedMessageTypePath: Mocked<MessageTypePath>

  beforeEach(() => {
    mockedRawSocket = createMockInstance(RawSocket)
    mockedMessageTypePath = createMockInstance(MessageTypePath)
    mockedMessageTypePath.getPath.mockReturnValue('message.input.Sensors')
    network = new NUsightNetwork(mockedRawSocket, mockedMessageTypePath)
  })

  describe('event handling', () => {
    it('starts listening event', () => {
      network.on(Sensors, jest.fn())
      expect(mockedRawSocket.listen).toHaveBeenCalledWith('message.input.Sensors')
    })

    it('stops listening to event', () => {
      const cb = jest.fn()
      network.on(Sensors, cb)

      network.off(Sensors, cb)
      expect(mockedRawSocket.unlisten).toHaveBeenCalledWith('message.input.Sensors')
    })

    it('only sends listening event once', () => {
      network.on(Sensors, jest.fn())
      network.on(Sensors, jest.fn())
      expect(mockedRawSocket.listen).toHaveBeenCalledTimes(1)
    })

    it('stops listening to type after all listeners have unsubscribed', () => {
      const cb1 = jest.fn()
      const cb2 = jest.fn()
      network.on(Sensors, cb1)
      network.on(Sensors, cb2)

      network.off(Sensors, cb1)
      expect(mockedRawSocket.unlisten).not.toHaveBeenCalled()

      network.off(Sensors, cb2)
      expect(mockedRawSocket.unlisten).toHaveBeenLastCalledWith('message.input.Sensors')
    })
  })
})
