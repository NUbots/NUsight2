import { DirectNUClearNetClient } from '../server/nuclearnet/direct_nuclearnet_client'
import { FakeNUClearNetClient } from '../server/nuclearnet/fake_nuclearnet_client'

import { Simulator } from './simulator'
import { VirtualRobot } from './virtual_robot'

type Opts = {
  fakeNetworking: boolean
  robots: Array<{name: string, simulators: Array<{ of(robot: VirtualRobot): Simulator }>}>
}

export class VirtualRobots {

  private robots: VirtualRobot[]

  constructor(opts: Opts) {
    this.robots = opts.robots.map(r =>
      VirtualRobot.of({ ...r, network: opts.fakeNetworking ? FakeNUClearNetClient.of() : DirectNUClearNetClient.of() }),
    )
  }

  static of(opts: Opts) {
    return new VirtualRobots(opts)
  }

  start() {
    this.robots.forEach(r => r.start())
  }
}
