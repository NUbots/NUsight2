import { action } from 'mobx'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Simulator } from '../simulator'

export class ScriptDataSimulator extends Simulator {
  constructor(network: NUClearNetClient) {
    super(network)
    this.network.on('message.input.Sensors', this.onSensors)
  }

  static of(network: NUClearNetClient) {
    return new ScriptDataSimulator(network)
  }

  start() {
    // TODO
    return () => 0
  }

  @action.bound
  onSensors(packet: NUClearNetPacket) {
    // console.log('ScriptDataSimulator: packet received', packet)
  }
}
