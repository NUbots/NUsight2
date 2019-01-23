import { computed } from 'mobx'
import { observable } from 'mobx'
import { now } from 'mobx-utils'

import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export interface Servo {
  id: string
  frames: Frame[]
}

export interface Frame {
  time: number,
  angle: number,
  pGain: number,
  iGain: number,
  dGain: number,
  torque: number,
}

import * as sampleScriptJson from './sample-script.json'

const sampleScript = sampleScriptJson as { [key: string]: Servo }

export class ScriptTunerModel {
  @observable robot: RobotModel
  @observable servos: Servo[]
  @observable isPlaying = false
  @observable currentTime = 0
  @observable playStartedAt = 0

  constructor(robotModels: RobotModel[]) {
    this.robot = RobotModel.of({
      id: 'Darwin #1',
      connected: true,
      enabled: true,
      name: 'Darwin #1',
      address: '127.0.0.1',
      port: 1234,
    })

    // These will come (perhaps over the network) from the selected robot
    this.servos = this.makeSampleServos()
  }

  static of(robots: RobotModel[]): ScriptTunerModel {
    return new ScriptTunerModel(robots)
  }

  @computed
  get startTime() {
    return 0
  }

  @computed
  get endTime() {
    return this.scriptsLength - 1
  }

  @computed
  get playTime() {
    const time = this.isPlaying
      ? this.currentTime + (now('frame') - this.playStartedAt) / 1000
      : this.currentTime

    return time >= this.endTime ? this.endTime : time
  }

  @computed
  get scriptsLength() {
    let maxLength = 0

    this.servos.forEach(servo => {
      if (servo.frames.length > maxLength) {
        maxLength = servo.frames.length
      }
    })

    return maxLength
  }

  private makeSampleServos(): Servo[] {
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

      return this.makeSampleServo(id, 5, 0)
    })
  }

  private makeSampleServo(id: string, length: number = 30, angle?: number): Servo {
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
}
