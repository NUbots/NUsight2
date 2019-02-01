import { IComputedValue } from 'mobx'
import { computed } from 'mobx'
import { action } from 'mobx'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { message } from '../../shared/proto/messages'
import { Simulator } from '../simulator'
import { Message } from '../simulator'
import { VirtualRobot } from '../virtual_robot'

import Sensors = message.input.Sensors

export class ScriptDataSimulator implements Simulator {

  constructor(private robot: VirtualRobot) {
    robot.network.on('message.input.Sensors', this.onSensors)
  }

  static of(robot: VirtualRobot) {
    return new ScriptDataSimulator(robot)
  }

  packets(): Array<IComputedValue<Message>> {
    return []
  }

  @action
  onSensors(packet: NUClearNetPacket) {
    // console.log('ScriptDataSimulator: packet received', packet)
  }
}
