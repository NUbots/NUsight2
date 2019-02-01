import { autorun } from 'mobx'
import { relative } from 'path'

import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'

import { Simulator } from './simulator'

type Opts = {
  name: string,
  simulators: Array<{ of(robot: VirtualRobot): Simulator }>,
  network: NUClearNetClient
}

export class VirtualRobot {

  private simulators: Simulator[]
  private stops?: Array<() => void>

  network: NUClearNetClient

  constructor(private name: string,
              network: NUClearNetClient,
              simulatorFactories: Array<{ of(robot: VirtualRobot): Simulator}>) {
    this.network = network
    this.simulators = simulatorFactories.map(f => f.of(this))

    // Connect to the network
    this.stops = [this.network.connect({ name: this.name })]
  }

  static of(opts: Opts) {
    return new VirtualRobot(opts.name, opts.network, opts.simulators)
  }

  start() {

     // Make an autorunner for each of the packets
    this.simulators.forEach(s => {
      s.packets().forEach(p => {
        this.stops!.push(autorun(() => {
          const packet = p.get()
          this.network.send({
            type: packet.messageType,
            payload: Buffer.from(packet.buffer),
            target: 'nusight',
            reliable: packet.reliable,
          })
        }))
      })
    })
  }

  sendAll() {
    this.simulators.forEach(s => {
      s.packets().forEach(p => {
        const packet = p.get()
        this.network.send({
          type: packet.messageType,
          payload: Buffer.from(packet.buffer),
          target: 'nusight',
          reliable: packet.reliable,
        })
      })
    })
  }
}
