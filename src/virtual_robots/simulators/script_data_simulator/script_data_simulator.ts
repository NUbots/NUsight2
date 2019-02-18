import { action } from 'mobx'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearNetClient } from '../../../shared/nuclearnet/nuclearnet_client'
import { message } from '../../../shared/proto/messages'
import { Simulator } from '../../simulator'

import LoadScriptsCommand = message.tools.script_tuner.LoadScriptsCommand
import Script = message.motion.script.IScript
import Scripts = message.tools.script_tuner.Scripts
import SaveScriptCommand = message.tools.script_tuner.SaveScriptCommand

import * as LeftFootPowerKick from './left_foot_power_kick.json'
import * as NodNo from './nod_no.json'
import * as NodYes from './nod_yes.json'
import * as RightFootPowerKick from './right_foot_power_kick.json'
import * as Salute from './salute.json'
import * as StandUpBack from './stand_up_back.json'
import * as StandUpFront from './stand_up_front.json'

export class ScriptDataSimulator extends Simulator {
  scripts: Script[]

  constructor(nuclearnetClient: NUClearNetClient) {
    super(nuclearnetClient)

    this.scripts = [
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
        path: 'stand_up_back.yaml',
        servos: StandUpBack,
      },
      {
        path: 'stand_up_front.yaml',
        servos: StandUpFront,
      },
    ]
  }

  static of({ nuclearnetClient }: { nuclearnetClient: NUClearNetClient }) {
    return new ScriptDataSimulator(nuclearnetClient)
  }

  start() {
    const offLoadScripts = this.nuclearnetClient.on('message.tools.script_tuner.LoadScriptsCommand', this.onLoadScripts)
    const offSaveScript = this.nuclearnetClient.on('message.tools.script_tuner.SaveScriptCommand', this.onSaveScript)

    return () => {
      offLoadScripts()
      offSaveScript()
    }
  }

  @action.bound
  onLoadScripts(packet: NUClearNetPacket) {
    this.send({
      messageType: 'message.tools.script_tuner.Scripts',
      buffer: Scripts.encode({ scripts: this.scripts }).finish(),
    })
  }

  @action.bound
  onSaveScript(packet: NUClearNetPacket) {
    const  decoded = packetToMessage<SaveScriptCommand>(SaveScriptCommand, packet)
    const index = this.scripts.findIndex(script => script.path === decoded.path)
    decoded.script!.path = decoded.path

    if (index > -1) {
      this.scripts[index] = decoded.script!
    } else {
      this.scripts.push(decoded.script!)
    }
  }
}

function packetToMessage<T>(messageType: MessageType<T>, packet: NUClearNetPacket) {
  const buffer = new Uint8Array(packet.payload)
  const message = messageType.decode(buffer)
  const peer = packet.peer
  return message
}

export interface MessageType<T> {
  new(...args: any[]): T
  decode(...args: any[]): T
}
