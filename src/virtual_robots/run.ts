import * as minimist from 'minimist'

import { Simulator } from './simulator'
import { ChartSimulator } from './simulators/chart_data_simulator'
import { OverviewSimulator } from './simulators/overview_simulator'
import { ScriptDataSimulator } from './simulators/script_data_simulator'
import { SensorsSimulator } from './simulators/sensors_simulator'
import { VirtualRobot } from './virtual_robot'
import { VirtualRobots } from './virtual_robots'

function main() {
  const args = minimist(process.argv.slice(2))

  const simulators  = getSimulators(args)
  const virtualRobots = VirtualRobots.of({
    fakeNetworking: false,
    robots: [
      { name: 'Robot #1', simulators },
      { name: 'Robot #2', simulators },
      { name: 'Robot #3', simulators },
      { name: 'Robot #4', simulators },
      { name: 'Robot #5', simulators },
      { name: 'Robot #6', simulators },
    ],
  })
  virtualRobots.start()
}

function getSimulators(args: minimist.ParsedArgs): Array<{ of(robot: VirtualRobot): Simulator }> {
  const simulators = []

  if (args.overview || args.all) {
    simulators.push(OverviewSimulator)
  }
  if (args.sensors || args.all) {
    simulators.push(SensorsSimulator)
  }
  if (args.chart || args.all) {
    simulators.push(ChartSimulator)
  }
  if (args.scripts || args.all) {
    simulators.push(ScriptDataSimulator)
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
