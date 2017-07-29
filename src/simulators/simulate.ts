import * as minimist from 'minimist'
import { ChartSimulator } from './chart_simulator'
import { OverviewSimulator } from './overview_simulator'
import { SensorDataSimulator } from './sensor_data_simulator'
import { Simulator } from './simulator'
import { VirtualRobots } from './virtual_robots'

function main() {
  const args = minimist(process.argv.slice(2))

  const simulators = getSimulators(args)
  const virtualRobots = VirtualRobots.of({
    fakeNetworking: false,
    numRobots: 6,
    simulators,
  })
  virtualRobots.simulateWithFrequency(60)
}

function getSimulators(args: minimist.ParsedArgs): Simulator[] {
  const simulators = []
  if (args.chart || args.all) {
    simulators.push(ChartSimulator.of())
  }
  if (args.overview || args.all) {
    simulators.push(OverviewSimulator.of())
  }
  if (args.sensors || args.all) {
    simulators.push(SensorDataSimulator.of())
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
