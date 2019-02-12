import { computed, values } from 'mobx'
import { observable } from 'mobx'
import { now } from 'mobx-utils'

import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export interface Frame {
  time: number,
  angle: number,
  pGain: number,
  iGain: number,
  dGain: number,
  torque: number,
}

export interface Servo {
  id: string
  frames: Frame[]
}

export interface Script {
  path: string
  servos: {[key: string]: Servo}
}

export class ScriptTunerModel {
  @observable robots: RobotModel[]
  @observable selectedRobot?: RobotModel
  @observable scripts: Script[]
  @observable selectedScript?: Script
  @observable isLoading = false
  @observable loadingMessage?: string
  @observable isPlaying = false
  @observable currentTime = 0
  @observable playStartedAt = 0

  constructor(robotModels: RobotModel[]) {
    this.robots = robotModels
    this.scripts = []
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
    return Math.max(this.scriptsLength - 1, 0)
  }

  @computed
  get playTime() {
    const time = this.isPlaying
      ? this.currentTime + (now('frame') - this.playStartedAt) / 1000
      : this.currentTime

    return time >= this.endTime ? this.endTime : time
  }

  @computed
  get selectedScriptServos() {
    if (this.selectedScript) {
      return values(this.selectedScript.servos)
    }
    return []
  }

  @computed
  get scriptsLength() {
    if (this.selectedScript) {
      let maxLength = 0

      this.selectedScriptServos.forEach(servo => {
        if (servo.frames.length > maxLength) {
          maxLength = servo.frames.length
        }
      })

      return maxLength
    }

    return 0
  }
}
