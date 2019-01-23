import * as bounds from 'binary-search-bounds'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Quaternion } from '../../../math/quaternion'
import { Vector3 } from '../../../math/vector3'
import { Frame, ScriptTunerModel } from '../model'
import { Robot3dViewModel } from '../model_visualiser/model'

export class ScriptRobot3dViewModel implements Robot3dViewModel {
  private model: ScriptTunerModel
  @observable color?: string
  @observable rWTt: Vector3
  @observable Rwt: Quaternion

  constructor({ model, color, rWTt, Rwt }: {
    model: ScriptTunerModel,
    color?: string,
    rWTt: Vector3,
    Rwt: Quaternion
  }) {
    this.model = model
    this.color = color || '#000000'
    this.rWTt = rWTt
    this.Rwt = Rwt
  }

  static of = createTransformer((model: ScriptTunerModel) => {
    return new ScriptRobot3dViewModel({
      model,
      rWTt: Vector3.of(),
      Rwt: Quaternion.of(),
    })
  })

  @computed
  get name() {
    return this.model.robot.name
  }

  @computed
  get RIGHT_SHOULDER_PITCH() {
    const servo = this.model.servos[0]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_SHOULDER_PITCH() {
    const servo = this.model.servos[1]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_SHOULDER_ROLL() {
    const servo = this.model.servos[2]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_SHOULDER_ROLL() {
    const servo = this.model.servos[3]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_ELBOW() {
    const servo = this.model.servos[4]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_ELBOW() {
    const servo = this.model.servos[5]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_HIP_YAW() {
    const servo = this.model.servos[6]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_HIP_YAW() {
    const servo = this.model.servos[7]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_HIP_ROLL() {
    const servo = this.model.servos[8]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_HIP_ROLL() {
    const servo = this.model.servos[9]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_HIP_PITCH() {
    const servo = this.model.servos[10]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_HIP_PITCH() {
    const servo = this.model.servos[11]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_KNEE() {
    const servo = this.model.servos[12]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_KNEE() {
    const servo = this.model.servos[13]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_ANKLE_PITCH() {
    const servo = this.model.servos[14]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_ANKLE_PITCH() {
    const servo = this.model.servos[15]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get RIGHT_ANKLE_ROLL() {
    const servo = this.model.servos[16]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get LEFT_ANKLE_ROLL() {
    const servo = this.model.servos[17]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get HEAD_YAW() {
    const servo = this.model.servos[18]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }

  @computed
  get HEAD_PITCH() {
    const servo = this.model.servos[19]

    if (servo.frames.length) {
      return getAngleAtCurrentTime(this.model.playTime, servo.frames)
    }

    return 0
  }
}

function getAngleAtCurrentTime(time: number, frames: Frame[]) {
  const rightFrameIndex = bounds.gt(frames, frames[0], (frame: Frame) => {
    return frame.time - time
  })

  if (rightFrameIndex === frames.length) {
    return frames[rightFrameIndex - 1].angle
  } else if (rightFrameIndex === 0) {
    return frames[0].angle
  }

  const leftFrameIndex = rightFrameIndex - 1

  return interpolateAngle(frames[leftFrameIndex], frames[rightFrameIndex], time)
}

function interpolateAngle(left: Frame, right: Frame, time: number): number {
  const { time: x1, angle: y1 } = left
  const { time: x2, angle: y2 } = right
  const slope = (y2 - y1) / (x2 - x1)

  return (slope * (time - x1)) + y1
}
