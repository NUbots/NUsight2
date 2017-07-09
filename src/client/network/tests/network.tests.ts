import { message } from '../../../shared/proto/messages'
import { Network } from '../network'
import Sensors = message.input.Sensors
import { createMockInstance } from '../../../shared/base/testing/create_mock_instance'
import { NUsightNetwork } from '../nusight_network'
import Mocked = jest.Mocked

describe('Network', () => {
  let nusightNetwork: Mocked<NUsightNetwork>
  let network: Network

  beforeEach(() => {
    nusightNetwork = createMockInstance(NUsightNetwork)
    network = new Network(nusightNetwork)
  })

  it('off() automatically unregisters all callbacks', () => {
    const off = jest.fn()
    nusightNetwork.onNUClearMessage.mockReturnValue(off)

    const cb1 = jest.fn()
    const cb2 = jest.fn()

    network.on(Sensors, cb1)
    expect(nusightNetwork.onNUClearMessage).toHaveBeenCalledWith(Sensors, cb1)

    network.on(Sensors, cb2)
    expect(nusightNetwork.onNUClearMessage).toHaveBeenCalledWith(Sensors, cb2)

    network.off()
    expect(off).toHaveBeenCalledTimes(2)
  })
})
