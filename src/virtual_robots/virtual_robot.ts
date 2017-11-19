import { DirectNUClearNetClient } from '../server/nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from '../server/nuclearnet/fake_nuclearnet_client'
import { NodeSystemClock } from '../server/time/node_clock'
import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'
import { Clock } from '../shared/time/clock'
import { flatMap } from './flat_map'
import { Simulator } from './simulator'

type Opts = {
  fakeNetworking: boolean
  name: string
  simulators: SimulatorOpts[]
}

export type SimulatorOpts = {
  frequency: number,
  simulator: Simulator
}

export class VirtualRobot {
  private name: string
  private simulators: SimulatorOpts[]

  constructor(private network: NUClearNetClient,
              private clock: Clock,
              opts: { name: string, simulators: SimulatorOpts[] }) {
    this.name = opts.name
    this.simulators = opts.simulators
  }

  public static of(opts: Opts): VirtualRobot {
    const network = opts.fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of()
    const clock = NodeSystemClock
    return new VirtualRobot(network, clock, opts)
  }

  public startSimulators(index: number, numRobots: number) {
    const disconnect = this.connect()

    const stops = this.simulators.map(opts => {
      const period = 1 / opts.frequency
      return this.clock.setInterval(() => this.simulate(opts.simulator, index, numRobots), period)
    })

    return () => {
      stops.forEach(stop => stop())
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

  public simulateAll(index: number, numRobots: number) {
    const messages = flatMap(opts => opts.simulator.simulate(this.clock.now(), index, numRobots), this.simulators)
    messages.forEach(message => this.send(message.messageType, message.buffer))
    return messages
  }

  public connect(): () => void {
    return this.network.connect({ name: this.name })
  }

  private simulate(simulator: Simulator, index: number, numRobots: number) {
    const messages = simulator.simulate(this.clock.now(), index, numRobots)
    messages.forEach(message => this.send(message.messageType, message.buffer))
    return messages
  }
}
