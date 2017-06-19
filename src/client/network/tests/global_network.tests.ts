import 'reflect-metadata'
import { createMockInstance } from '../../../shared/common/testing/create_mock_instance'
import { message } from '../../../shared/proto/messages'
import { GlobalNetwork } from '../global_network'
import { RawSocket } from '../raw_socket'
import Socket = SocketIOClient.Socket
import Sensors = message.input.Sensors
import { MessageTypePath } from '../message_type_names'
import Mocked = jest.Mocked

describe('GlobalNetwork', () => {
  let network: GlobalNetwork
  let fakeSocket: Mocked<RawSocket>
  let fakeMessageTypePath: Mocked<MessageTypePath>

  beforeEach(() => {
    fakeSocket = createMockInstance(RawSocket)
    fakeMessageTypePath = createMockInstance(MessageTypePath)
    fakeMessageTypePath.getPath.mockReturnValue('message.input.Sensors')
    network = new GlobalNetwork(fakeSocket, fakeMessageTypePath)
  })

  describe('event handling', () => {
    it('starts listening event', () => {
      network.on(Sensors, jest.fn())
      expect(fakeSocket.listen).toHaveBeenCalledWith('message.input.Sensors')
    })

    it('stops listening to event', () => {
      const cb = jest.fn()
      network.on(Sensors, cb)

      network.off(Sensors, cb)
      expect(fakeSocket.unlisten).toHaveBeenCalledWith('message.input.Sensors')
    })

    it('only sends listening event once', () => {
      network.on(Sensors, jest.fn())
      network.on(Sensors, jest.fn())
      expect(fakeSocket.listen).toHaveBeenCalledTimes(1)
    })

    it('stops listening to type after all listeners have unsubscribed', () => {
      const cb1 = jest.fn()
      const cb2 = jest.fn()
      network.on(Sensors, cb1)
      network.on(Sensors, cb2)

      network.off(Sensors, cb1)
      expect(fakeSocket.unlisten).not.toHaveBeenCalled()

      network.off(Sensors, cb2)
      expect(fakeSocket.unlisten).toHaveBeenLastCalledWith('message.input.Sensors')
    })
  })
})
