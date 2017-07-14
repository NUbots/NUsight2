import * as minimist from 'minimist'
import { RobotSimulator } from './robot_simulator'
import { SensorDataSimulator } from './sensor_data_simulator'
import { Simulator } from './simulator'

function main() {
  const args = minimist(process.argv.slice(2))

  const simulators = getSimulators(args)
  const robotSimulator = RobotSimulator.of({
    fakeNetworking: false,
    numRobots: 1,
    simulators,
  })
  robotSimulator.simulateWithFrequency(60)
}

function getSimulators(args: minimist.ParsedArgs): Simulator[] {
  const simulators = []
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
