import * as bounds from 'binary-search-bounds'
import { action, autorun, IReactionDisposer } from 'mobx'

import { DarwinMotorSet, LocalisationRobotModel } from '../localisation/darwin_robot/model'

import { Frame, ScriptTunerModel, Servo } from './model'
import { ScriptTunerNetwork } from './network'

interface ScriptTunerOpts {
  network: ScriptTunerNetwork
  model: ScriptTunerModel
}

export class ScriptTunerController {
  network: ScriptTunerNetwork
  model: ScriptTunerModel
  stopPlaytimeAutorun?: IReactionDisposer

  constructor(opts: ScriptTunerOpts) {
    this.network = opts.network
    this.model = opts.model

    this.stopPlaytimeAutorun = autorun(() => {
      if (this.model.playTime >= this.model.endTime) {
        this.togglePlayback(false)
      }

      this.updateMotors(getAnglesAtCurrentTime(this.model.playTime, this.model.servos))
    })

    // TODO need to add an autorunner that if we are connected to the robot we need to send it update packets
  }

  static of(opts: ScriptTunerOpts) {
    return new ScriptTunerController(opts)
  }

  @action
  setPlayTime(time: number) {
    this.model.currentTime = Math.min(Math.max(time, this.model.startTime), this.model.endTime)
    this.model.playStartedAt = Date.now()
  }

  @action
  togglePlayback(isPlaying: boolean = !this.model.isPlaying) {
    if (isPlaying) {
      this.model.playStartedAt = Date.now()
    } else {
      this.model.currentTime = this.model.playTime
    }

    this.model.isPlaying = isPlaying
  }

  @action
  updateMotors(angles: number[]) {
    const robot = LocalisationRobotModel.of(this.model.currentRobot)

    Object.keys(robot.motors).forEach((key: string, i) => {
      robot.motors[key as keyof DarwinMotorSet].angle = angles[i]
    })

    this.model.currentRobotModel = robot
  }
}

function getAnglesAtCurrentTime(time: number, servos: Servo[]) {
  return servos.map(servo => {
    const compare = (frame: Frame) => frame.time - time
    const rightFrame = bounds.gt(servo.frames, servo.frames[0], compare)

    if (rightFrame === servo.frames.length) {
      return servo.frames[rightFrame - 1].angle
    } else if (rightFrame === 0) {
      return servo.frames[0].angle
    }

    const leftFrame = rightFrame - 1

    return interpolateAngle(servo.frames[leftFrame], servo.frames[rightFrame], time)
  })
}

function interpolateAngle(left: Frame, right: Frame, time: number): number {
  const { time: x1, angle: y1 } = left
  const { time: x2, angle: y2 } = right
  const slope = (y2 - y1) / (x2 - x1)

  return (slope * (time - x1)) + y1
}
