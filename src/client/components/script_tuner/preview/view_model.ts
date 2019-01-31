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
    return this.model.servos[0].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[0].frames)
      : 0
  }

  @computed
  get LEFT_SHOULDER_PITCH() {
    return this.model.servos[1].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[1].frames)
      : 0
  }

  @computed
  get RIGHT_SHOULDER_ROLL() {
    return this.model.servos[2].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[2].frames)
      : 0
  }

  @computed
  get LEFT_SHOULDER_ROLL() {
    return this.model.servos[3].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[3].frames)
      : 0
  }

  @computed
  get RIGHT_ELBOW() {
    return this.model.servos[4].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[4].frames)
      : 0
  }

  @computed
  get LEFT_ELBOW() {
    return this.model.servos[5].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[5].frames)
      : 0
  }

  @computed
  get RIGHT_HIP_YAW() {
    return this.model.servos[6].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[6].frames)
      : 0
  }

  @computed
  get LEFT_HIP_YAW() {
    return this.model.servos[7].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[7].frames)
      : 0
  }

  @computed
  get RIGHT_HIP_ROLL() {
    return this.model.servos[8].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[8].frames)
      : 0
  }

  @computed
  get LEFT_HIP_ROLL() {
    return this.model.servos[9].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[9].frames)
      : 0
  }

  @computed
  get RIGHT_HIP_PITCH() {
    return this.model.servos[10].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[10].frames)
      : 0
  }

  @computed
  get LEFT_HIP_PITCH() {
    return this.model.servos[11].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[11].frames)
      : 0
  }

  @computed
  get RIGHT_KNEE() {
    return this.model.servos[12].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[12].frames)
      : 0
  }

  @computed
  get LEFT_KNEE() {
    return this.model.servos[13].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[13].frames)
      : 0
  }

  @computed
  get RIGHT_ANKLE_PITCH() {
    return this.model.servos[14].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[14].frames)
      : 0
  }

  @computed
  get LEFT_ANKLE_PITCH() {
    return this.model.servos[15].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[15].frames)
      : 0
  }

  @computed
  get RIGHT_ANKLE_ROLL() {
    return this.model.servos[16].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[16].frames)
      : 0
  }

  @computed
  get LEFT_ANKLE_ROLL() {
    return this.model.servos[17].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[17].frames)
      : 0
  }

  @computed
  get HEAD_YAW() {
    return this.model.servos[18].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[18].frames)
      : 0
  }

  @computed
  get HEAD_PITCH() {
    return this.model.servos[19].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, this.model.servos[19].frames)
      : 0
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
