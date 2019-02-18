import { computed, values } from 'mobx'
import { observable } from 'mobx'
import { IViewModel, now } from 'mobx-utils'

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
  @observable scripts: Script[] = []
  @observable selectedScript?: IViewModel<Script> & Script
  @observable isLoading = false
  @observable loadingMessage?: string
  @observable isPlaying = false
  @observable currentTime = 0
  @observable playStartedAt = 0
  previousTimelineLength = 0

  constructor(robotModels: RobotModel[]) {
    this.robots = robotModels
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
    return Math.max(this.timelineLength - 1, 0)
  }

  @computed
  get playTime() {
    const time = this.isPlaying
      ? this.currentTime + (now('frame') - this.playStartedAt)
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
  get timelineLength() {
    if (this.selectedScript) {
      let maxLength = 0

      this.selectedScriptServos.forEach(servo => {
        const max = Math.max(...servo.frames.map((frame: Frame) => frame.time))

        if (max > maxLength) {
          // Add 1000ms to the last frame time and round up to the nearest second
          maxLength = roundUpTo(1000 + max, 1000)
        }
      })

      if (maxLength > this.previousTimelineLength) {
        this.previousTimelineLength = maxLength
      }

      return this.previousTimelineLength
    }

    return 0
  }
}

function roundUpTo(value: number, nearest: number) {
  return Math.ceil(value / nearest) * nearest
}
