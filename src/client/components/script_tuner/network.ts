import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { Frame, Script, ScriptTunerModel, Servo } from './model'

import LoadScriptsCommand = message.tools.script_tuner.LoadScriptsCommand
import Scripts = message.tools.script_tuner.Scripts

export class ScriptTunerNetwork {
  constructor(private network: Network, private model: ScriptTunerModel) {
    this.network.on(Scripts, this.onScripts)
  }

  static of(nusightNetwork: NUsightNetwork, model: ScriptTunerModel): ScriptTunerNetwork {
    const network = Network.of(nusightNetwork)
    return new ScriptTunerNetwork(network, model)
  }

  destroy() {
    this.network.off()
  }

  @action
  requestScripts(robot: RobotModel) {
    this.startLoader(`Loading scripts from ${robot.name}...`)
    const send = {
      target: robot.name,
      type: 'message.tools.script_tuner.LoadScriptsCommand',
      payload: Buffer.from(LoadScriptsCommand.encode({}).finish()),
    }
    console.log('sending message', send)
    this.network.send(send)
  }

  @action
  private onScripts = (robotModel: RobotModel, scripts: Scripts) => {
    console.log('scripts received', robotModel, scripts)
    this.model.scripts = Scripts.toObject(scripts).scripts as Script[]
    console.log(this.model.scripts)
    this.stopLoader()
  }

  @action
  private startLoader(message: string = 'Loading...') {
    this.model.loadingMessage = message
    this.model.isLoading = true
  }

  @action
  private stopLoader() {
    this.model.isLoading = false
    this.model.loadingMessage = ''
  }
}
