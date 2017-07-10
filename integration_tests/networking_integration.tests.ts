import { Network } from '../src/client/network/network'
import { NUsightNetwork } from '../src/client/network/nusight_network'
import { FakeNUClearNetServer } from '../src/server/nuclearnet/fake_nuclearnet_server'
import { FakeNUClearNetClient } from '../src/server/nuclearnet/fake_nuclearnet_client'
import { MessageTypePath } from '../src/client/network/message_type_names'
import { message } from '../src/shared/proto/messages'
import Sensors = message.input.Sensors
import { RobotSimulator } from '../src/simulators/robot_simulator'
import { NodeSystemClock } from '../src/server/time/node_clock'
import { SensorDataSimulator } from '../src/simulators/sensor_data_simulator'

describe('Networking Integration', () => {
  let nuclearnetServer: FakeNUClearNetServer
  let network: Network
  let robotSimulator: RobotSimulator

  beforeEach(() => {
    nuclearnetServer = new FakeNUClearNetServer()
    const nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    const messageTypePath = new MessageTypePath()
    const nusightNetwork = new NUsightNetwork(nuclearnetClient, messageTypePath)
    nusightNetwork.connect({ name: 'nusight' })

    robotSimulator = new RobotSimulator(
      new FakeNUClearNetClient(nuclearnetServer),
      NodeSystemClock,
      {
        name: 'Robot #1',
        simulators: [
          new SensorDataSimulator(),
        ],
      },
    )

    network = new Network(nusightNetwork)
  })

  describe('a networking component', () => {
    it('receives a Sensors message after subscribing and a robot sending it', () => {
      const onSensors = jest.fn()
      network.on(Sensors, onSensors)

      robotSimulator.simulate()

      expect(onSensors).toHaveBeenCalledWith(expect.any(Sensors))
      expect(onSensors).toHaveBeenCalledTimes(1)
    })
  })
})
