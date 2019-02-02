import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'

import { Simulator } from './simulator'

export class VirtualRobot {
  constructor(
    private readonly name: string,
    private readonly network: NUClearNetClient,
    private readonly simulators: Simulator[],
  ) {
    this.network.connect({ name: this.name })
  }

  static of({ name, network, simulators }: {
    name: string,
    simulators: Simulator[],
    network: NUClearNetClient
  }) {
    return new VirtualRobot(name, network, simulators)
  }

  start(): () => void {
    const stops = this.simulators.map(simulator => simulator.start())
    return () => stops.forEach(stop => stop())
  }
}
