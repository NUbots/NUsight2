import { computed } from 'mobx'
import { observable } from 'mobx'

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

  private makeSampleServo(length: number = 30): Servo {
    const frames = []
    const period = 10

    for (let i = 0; i <= length; i++) {
      const theta = (2 * Math.PI * i) / period

      frames.push({
        time: i,
        angle: Math.sin(theta),
        pGain: 0,
        iGain: 0,
        dGain: 0,
        torque: 0,
      })
    }

    return { frames }
  }
}
