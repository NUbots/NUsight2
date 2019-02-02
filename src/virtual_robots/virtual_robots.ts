import { DirectNUClearNetClient } from '../server/nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from '../server/nuclearnet/fake_nuclearnet_client'

import { ChartSimulator } from './simulators/chart_data_simulator'
import { OverviewSimulator } from './simulators/overview_simulator'
import { ScriptDataSimulator } from './simulators/script_data_simulator'
import { SensorsSimulator } from './simulators/sensors_simulator'
import { VisionSimulator } from './simulators/vision_simulator'
import { VirtualRobot } from './virtual_robot'

export class VirtualRobots {
  private robots: VirtualRobot[]

  constructor({ robots }: { robots: VirtualRobot[] }) {
    this.robots = robots
  }

  static of({ fakeNetworking, numRobots }: { fakeNetworking: boolean, numRobots: number }) {
    const robots = Array.from({ length: numRobots }, (_, i) => {
      const network = fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
      return VirtualRobot.of({
        name: `Virtual Robot ${i + 1}`,
        network,
        simulators: [
          OverviewSimulator.of(network),
          SensorsSimulator.of(network),
          ChartSimulator.of(network),
          VisionSimulator.of(network),
          ScriptDataSimulator.of(network),
        ],
      })
    })
    return new VirtualRobots({ robots })
  }

  start(): () => void {
    const stops = this.robots.map(robot => robot.start())
    return () => stops.forEach(stop => stop())
  }
}
