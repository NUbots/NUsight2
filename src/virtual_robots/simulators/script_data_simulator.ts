import { action } from 'mobx'
import { IComputedValue } from 'mobx'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Simulator } from '../simulator'
import { Message } from '../simulator'

export class ScriptDataSimulator implements Simulator {

  constructor(private readonly network: NUClearNetClient) {
    this.network.on('message.input.Sensors', this.onSensors)
  }

  static of(network: NUClearNetClient) {
    return new ScriptDataSimulator(network)
  }

  packets(): Array<IComputedValue<Message>> {
    return []
  }

  @action.bound
  onSensors(packet: NUClearNetPacket) {
    // console.log('ScriptDataSimulator: packet received', packet)
  }
}
