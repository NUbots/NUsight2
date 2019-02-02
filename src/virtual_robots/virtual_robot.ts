import { autorun } from 'mobx'

import { NUClearNetClient } from '../shared/nuclearnet/nuclearnet_client'

import { Simulator } from './simulator'

type Opts = {
  name: string,
  simulators: Simulator[],
  network: NUClearNetClient
}

export class VirtualRobot {
  private stops?: Array<() => void>

  constructor(private readonly name: string,
              private readonly network: NUClearNetClient,
              private readonly simulators: Simulator[],
  ) {
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
