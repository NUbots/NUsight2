import { computed } from 'mobx'
import { observable } from 'mobx'
import { now } from 'mobx-utils'

import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export interface Servo {
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

export class ScriptTunerModel {
  @observable private robotModels: RobotModel[]
  @observable servos: Servo[]
  @observable isPlaying = false
  @observable currentTime = 0
  @observable playStartedAt = 0

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
    this.servos = [
      this.makeSampleServo(60),
      this.makeSampleServo(60),
      this.makeSampleServo(60),
    ]
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

  private makeSampleServo(length: number = 30): Servo {
    const frames = []
    const period = 10

    for (let i = 0; i <= length; i++) {
      const theta = (2 * Math.PI * i) / period

      frames.push({
        time: i,
        angle: 2 * Math.sin(theta),
        pGain: 0,
        iGain: 0,
        dGain: 0,
        torque: 0,
      })
    }

    return { frames }
  }
}
