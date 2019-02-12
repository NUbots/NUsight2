import { action } from 'mobx'
import { NUClearNetPacket } from 'nuclearnet.js'

import { NUClearNetClient } from '../../../shared/nuclearnet/nuclearnet_client'
import { message } from '../../../shared/proto/messages'
import { Simulator } from '../../simulator'

import LoadScriptsCommand = message.tools.script_tuner.LoadScriptsCommand
import Scripts = message.tools.script_tuner.Scripts

import * as SaluteScript from './salute.json'

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
          path: 'salute.yaml',
          servos: SaluteScript,
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
