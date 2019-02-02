import * as minimist from 'minimist'

import { DirectNUClearNetClient } from '../server/nuclearnet/direct_nuclearnet_client'

import { Simulator } from './simulator'
import { ChartSimulator } from './simulators/chart_data_simulator'
import { OverviewSimulator } from './simulators/overview_simulator'
import { ScriptDataSimulator } from './simulators/script_data_simulator'
import { SensorsSimulator } from './simulators/sensors_simulator'
import { VirtualRobot } from './virtual_robot'
import { VirtualRobots } from './virtual_robots'

function main() {
  const args = minimist(process.argv.slice(2))

  const simulators = getSimulators(args)
  const network = DirectNUClearNetClient.of()
  const virtualRobots = new VirtualRobots({
    robots: Array.from({ length: 6 }, (_, i) => VirtualRobot.of({
      name: `Virtual Robot ${i + 1}`,
      network,
      simulators,
    })),
  })
  virtualRobots.start()
}

function getSimulators(args: minimist.ParsedArgs): Simulator[] {
  const simulators = []

  if (args.overview || args.all) {
    simulators.push(OverviewSimulator.of())
  }
  if (args.sensors || args.all) {
    simulators.push(SensorsSimulator.of())
  }
  if (args.chart || args.all) {
    simulators.push(ChartSimulator.of())
  }
  if (args.scripts || args.all) {
    simulators.push(ScriptDataSimulator.of())
  }
  if (simulators.length === 0) {
    // If no simulators given, enable them all.
    return getSimulators({ ...args, all: true })
  }
  return simulators
}

if (require.main === module) {
  main()
}
