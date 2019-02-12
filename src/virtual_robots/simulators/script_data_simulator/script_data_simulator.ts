import { action } from 'mobx'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearNetClient } from '../../../shared/nuclearnet/nuclearnet_client'
import { message } from '../../../shared/proto/messages'
import { Simulator } from '../../simulator'

import LoadScriptsCommand = message.tools.script_tuner.LoadScriptsCommand
import Scripts = message.tools.script_tuner.Scripts

import * as Bow from './bow.json'
import * as Jump from './jump.json'
import * as LeftFootPowerKick from './left_foot_power_kick.json'
import * as NodNo from './nod_no.json'
import * as NodYes from './nod_yes.json'
import * as RightFootPowerKick from './right_foot_power_kick.json'
import * as Salute from './salute.json'
import * as Stand from './stand.json'
import * as StandUpBack from './stand_up_back.json'
import * as StandUpFront from './stand_up_front.json'
import * as Zombie from './zombie.json'

export class ScriptDataSimulator extends Simulator {
  constructor(nuclearnetClient: NUClearNetClient) {
    super(nuclearnetClient)
  }

  static of({ nuclearnetClient }: { nuclearnetClient: NUClearNetClient }) {
    return new ScriptDataSimulator(nuclearnetClient)
  }

  start() {
    console.log('ScriptDataSimulator Started')

    const off = this.nuclearnetClient.on('message.tools.script_tuner.LoadScriptsCommand', this.onLoadScripts)

    return () => {
      off()
    }
  }

  @action.bound
  onLoadScripts(packet: NUClearNetPacket) {
    console.log('Load scripts command received', packet)
    const scripts = {
      scripts: [
        {
          path: 'bow.yaml',
          servos: Bow,
        },
        {
          path: 'jump.yaml',
          servos: Jump,
        },
        {
          path: 'left_foot_power_kick.yaml',
          servos: LeftFootPowerKick,
        },
        {
          path: 'nod_no.yaml',
          servos: NodNo,
        },
        {
          path: 'nod_yes.yaml',
          servos: NodYes,
        },
        {
          path: 'right_foot_power_kick.yaml',
          servos: RightFootPowerKick,
        },
        {
          path: 'salute.yaml',
          servos: Salute,
        },
        {
          path: 'stand.yaml',
          servos: Stand,
        },
        {
          path: 'stand_up_back.yaml',
          servos: StandUpBack,
        },
        {
          path: 'stand_up_front.yaml',
          servos: StandUpFront,
        },
        {
          path: 'zombie.yaml',
          servos: Zombie,
        },
      ],
    }
    this.send({
      messageType: 'message.tools.script_tuner.Scripts',
      buffer: Scripts.encode(scripts).finish(),
    })
    console.log('Responded with', scripts)
  }
}
