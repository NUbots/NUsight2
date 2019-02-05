import { action } from 'mobx'

import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { Frame, Servo, Script, ScriptTunerModel } from './model'

import * as sampleScriptJson from './sample-script.json'
const sampleScript = sampleScriptJson as { [key: string]: Servo }

export class ScriptTunerNetwork {
  constructor(private network: Network, private model: ScriptTunerModel) {
  }

  static of(nusightNetwork: NUsightNetwork, model: ScriptTunerModel): ScriptTunerNetwork {
    const network = Network.of(nusightNetwork)
    return new ScriptTunerNetwork(network, model)
  }

  @action
  requestScripts(robot: RobotModel) {
    this.startLoader(`Loading scripts from ${robot.name}...`)
    setTimeout(() => {
      this.onScripts()
      this.stopLoader()
    }, 5000)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onScripts() {
    this.model.scripts = [
      {
        path: 'Salute.yaml',
        servos: makeSampleServos()
      }
    ]
    this.model.isLoading = false
    this.model.loadingMessage = ''
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

function makeSampleServos(): Servo[] {
  return [
    'RIGHT_SHOULDER_PITCH',
    'LEFT_SHOULDER_PITCH',
    'RIGHT_SHOULDER_ROLL',
    'LEFT_SHOULDER_ROLL',
    'RIGHT_ELBOW',
    'LEFT_ELBOW',
    'RIGHT_HIP_YAW',
    'LEFT_HIP_YAW',
    'RIGHT_HIP_ROLL',
    'LEFT_HIP_ROLL',
    'RIGHT_HIP_PITCH',
    'LEFT_HIP_PITCH',
    'RIGHT_KNEE',
    'LEFT_KNEE',
    'RIGHT_ANKLE_PITCH',
    'LEFT_ANKLE_PITCH',
    'RIGHT_ANKLE_ROLL',
    'LEFT_ANKLE_ROLL',
    'HEAD_YAW',
    'HEAD_PITCH',
  ].map(id => {
    if (sampleScript[id]) {
      return sampleScript[id]
    }

    return makeSampleServo(id, 5, 0)
  })
}

function makeSampleServo(id: string, length: number = 30, angle?: number): Servo {
  const frames = []
  const period = 10

  for (let i = 0; i <= length; i++) {
    const theta = (2 * Math.PI * i) / period

    frames.push({
      time: i,
      angle: angle !== undefined ? angle : 2 * Math.sin(theta),
      pGain: 0,
      iGain: 0,
      dGain: 0,
      torque: 0,
    })
  }

  return { id, frames }
}
