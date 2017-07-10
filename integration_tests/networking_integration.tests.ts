import { Network } from '../src/client/network/network'
import { NUsightNetwork } from '../src/client/network/nusight_network'
import { FakeNUClearNetServer } from '../src/server/nuclearnet/fake_nuclearnet_server'
import { FakeNUClearNetClient } from '../src/server/nuclearnet/fake_nuclearnet_client'
import { MessageTypePath } from '../src/client/network/message_type_names'
import { message } from '../src/shared/proto/messages'
import Sensors = message.input.Sensors
import VisionObject = message.vision.VisionObject
import Overview = message.support.nubugger.Overview
import { RobotSimulator } from '../src/simulators/robot_simulator'
import { NodeSystemClock } from '../src/server/time/node_clock'
import { SensorDataSimulator } from '../src/simulators/sensor_data_simulator'

describe('Networking Integration', () => {
  let nuclearnetServer: FakeNUClearNetServer
  let nusightNetwork: NUsightNetwork
  let robotSimulator: RobotSimulator

  beforeEach(() => {
    nuclearnetServer = new FakeNUClearNetServer()
    const nuclearnetClient = new FakeNUClearNetClient(nuclearnetServer)
    const messageTypePath = new MessageTypePath()
    nusightNetwork = new NUsightNetwork(nuclearnetClient, messageTypePath)
    nusightNetwork.connect({ name: 'nusight' })

    robotSimulator = new RobotSimulator(
      new FakeNUClearNetClient(nuclearnetServer),
      NodeSystemClock,
      {
        name: 'Robot #1',
        simulators: [
          // TODO (Annable): Add vision and overview simulators when they exist
          new SensorDataSimulator(),
        ],
      },
    )
  })

  describe('a single networked component', () => {
    let network

    beforeEach(() => {
      network = new Network(nusightNetwork)
    })

    it('receives a Sensors message after subscribing and a robot sending it', () => {
      const onSensors = jest.fn()
      network.on(Sensors, onSensors)

      robotSimulator.simulate()

      expect(onSensors).toHaveBeenCalledWith(expect.any(Sensors))
      expect(onSensors).toHaveBeenCalledTimes(1)
    })

    it('does not receive any messages after unsubscribing', () => {
      const onSensors1 = jest.fn()
      const onSensors2 = jest.fn()
      network.on(Sensors, onSensors1)
      network.on(Sensors, onSensors2)

      network.off()

      robotSimulator.simulate()

      expect(onSensors1).not.toHaveBeenCalled()
      expect(onSensors2).not.toHaveBeenCalled()
    })

    it('does not receive message on specific unsubscribed callback', () => {
      const onSensors1 = jest.fn()
      const onSensors2 = jest.fn()
      const off1 = network.on(Sensors, onSensors1)
      network.on(Sensors, onSensors2)

      off1()

      robotSimulator.simulate()

      expect(onSensors1).not.toHaveBeenCalled()
      expect(onSensors2).toHaveBeenCalledWith(expect.any(Sensors))
    })
  })

  describe('multiple networked components', () => {
    let localisationNetwork: Network
    let visionNetwork: Network
    let dashboardNetwork: Network

    beforeEach(() => {
      localisationNetwork = new Network(nusightNetwork)
      visionNetwork = new Network(nusightNetwork)
      dashboardNetwork = new Network(nusightNetwork)
    })

    it('subscribes and unsubscribes as expected when switching between components', () => {
      const onSensors = jest.fn()
      localisationNetwork.on(Sensors, onSensors)

      robotSimulator.simulate()

      expect(onSensors).toHaveBeenCalledTimes(1)

      localisationNetwork.off()

      const onVisionObject = jest.fn()
      visionNetwork.on(VisionObject, onVisionObject)

      robotSimulator.simulate()

      expect(onVisionObject).toHaveBeenCalledTimes(0)
      expect(onSensors).toHaveBeenCalledTimes(1)

      visionNetwork.off()

      const onOverview = jest.fn()
      dashboardNetwork.on(Overview, onOverview)

      expect(onOverview).toHaveBeenCalledTimes(0)
      expect(onVisionObject).toHaveBeenCalledTimes(0)
      expect(onSensors).toHaveBeenCalledTimes(1)

      dashboardNetwork.off()
    })
  })
})
