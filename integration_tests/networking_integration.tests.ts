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
  it('Simulate a component listening to a message that is sent by a simulated robot', () => {
    const nuclearnetServer = new FakeNUClearNetServer()
    const nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    const messageTypePath = new MessageTypePath()
    const nusightNetwork = new NUsightNetwork(nuclearnetClient, messageTypePath)
    nusightNetwork.connect({ name: 'nusight' })

    const cb = jest.fn()
    const componentNetwork = new Network(nusightNetwork)
    componentNetwork.on(Sensors, cb)

    new RobotSimulator(
      new FakeNUClearNetClient(nuclearnetServer),
      NodeSystemClock,
      {
        name: 'Robot #1',
        simulators: [
          new SensorDataSimulator(),
        ],
      },
    ).simulate()

    expect(cb).toHaveBeenCalledWith(expect.any(Sensors))
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
