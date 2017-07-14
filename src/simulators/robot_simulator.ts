import { Clock } from '../../src/server/time/clock'
import { DirectNUClearNetClient } from '../server/nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from '../server/nuclearnet/fake_nuclearnet_client'
import { NodeSystemClock } from '../server/time/node_clock'
import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'
import { flatMap } from './flat_map'
import { Simulator } from './simulator'

export class RobotSimulator {
  private robots: SimulatedRobot[]

  public constructor(opts: { robots: SimulatedRobot[] }) {
    this.robots = opts.robots
  }

  public static of(opts: { fakeNetworking: boolean, numRobots: number; simulators: Simulator[] }): RobotSimulator {
    const robots = range(opts.numRobots).map(index => SimulatedRobot.of({
      fakeNetworking: opts.fakeNetworking,
      name: `Simulated Robot #${index + 1}`,
      simulators: opts.simulators,
    }))
    return new RobotSimulator({ robots })
  }

  public simulateWithFrequency(frequency: number): () => void {
    const stops = this.robots.map((robot, index) => robot.simulateWithFrequency(frequency, index, this.robots.length))
    return () => stops.forEach(stop => stop())
  }

  public simulate(): void {
    this.robots.forEach((robot, index) => robot.simulate(index, this.robots.length))
  }

  public connect(): void {
    this.robots.forEach(robot => robot.connect())
  }
}

type SimulatedRobotOpts = {
  fakeNetworking: boolean
  name: string
  simulators: Simulator[]
}

export class SimulatedRobot {
  private name: string
  private simulators: Simulator[]

  constructor(private network: NUClearNetClient,
              private clock: Clock,
              opts: { name: string, simulators: Simulator[] }) {
    this.name = opts.name
    this.simulators = opts.simulators
  }

  public static of(opts: SimulatedRobotOpts): SimulatedRobot {
    const network = opts.fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
    const clock = NodeSystemClock
    return new SimulatedRobot(network, clock, opts)
  }

  public simulateWithFrequency(frequency: number, index: number, numRobots: number) {
    const disconnect = this.connect()

    const period = 1000 / frequency
    const cancelLoop = this.clock.setInterval(() => this.simulate(index, numRobots), period)

    return () => {
      cancelLoop()
      disconnect()
    }
  }

  public send(messageType: string, buffer: Uint8Array, reliable?: boolean) {
    const header = new Buffer(9)
    header.writeUInt8(0, 0)
    // TODO: A 64bit timestamp used to be written to the header here, but it does not seem to be used?
    this.network.send({
      type: `NUsight<${messageType}>`,
      payload: Buffer.concat([header, new Buffer(buffer)]),
      target: 'nusight',
      reliable,
    })
  }

  public simulate(index: number, numRobots: number) {
    const messages = flatMap(simulator => simulator.simulate(this.clock.now(), index, numRobots), this.simulators)
    messages.forEach(message => this.send(message.messageType, message.buffer))
    return messages
  }

  public connect(): () => void {
    return this.network.connect({ name: this.name })
  }
}

function range(n: number): number[] {
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push(i)
  }
  return arr
}
