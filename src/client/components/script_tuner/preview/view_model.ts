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
    return this.model.sourceRobot ? this.model.sourceRobot.name : undefined
  }

  private getServoAngle(servoId: string) {
    const script = this.model.selectedScript
    return script && script.data.servos[servoId] && script.data.servos[servoId].frames.length
      ? getAngleAtCurrentTime(this.model.playTime, script.data.servos[servoId].frames)
      : 0
  }

  @computed
  get RIGHT_SHOULDER_PITCH() {
    return this.getServoAngle('RIGHT_SHOULDER_PITCH')
  }

  @computed
  get LEFT_SHOULDER_PITCH() {
    return this.getServoAngle('LEFT_SHOULDER_PITCH')
  }

  @computed
  get RIGHT_SHOULDER_ROLL() {
    return this.getServoAngle('RIGHT_SHOULDER_ROLL')
  }

  @computed
  get LEFT_SHOULDER_ROLL() {
    return this.getServoAngle('LEFT_SHOULDER_ROLL')
  }

  @computed
  get RIGHT_ELBOW() {
    return this.getServoAngle('RIGHT_ELBOW')
  }

  @computed
  get LEFT_ELBOW() {
    return this.getServoAngle('LEFT_ELBOW')
  }

  @computed
  get RIGHT_HIP_YAW() {
    return this.getServoAngle('RIGHT_HIP_YAW')
  }

  @computed
  get LEFT_HIP_YAW() {
    return this.getServoAngle('LEFT_HIP_YAW')
  }

  @computed
  get RIGHT_HIP_ROLL() {
    return this.getServoAngle('RIGHT_HIP_ROLL')
  }

  @computed
  get LEFT_HIP_ROLL() {
    return this.getServoAngle('LEFT_HIP_ROLL')
  }

  @computed
  get RIGHT_HIP_PITCH() {
    return this.getServoAngle('RIGHT_HIP_PITCH')
  }

  @computed
  get LEFT_HIP_PITCH() {
    return this.getServoAngle('LEFT_HIP_PITCH')
  }

  @computed
  get RIGHT_KNEE() {
    return this.getServoAngle('RIGHT_KNEE')
  }

  @computed
  get LEFT_KNEE() {
    return this.getServoAngle('LEFT_KNEE')
  }

  @computed
  get RIGHT_ANKLE_PITCH() {
    return this.getServoAngle('RIGHT_ANKLE_PITCH')
  }

  @computed
  get LEFT_ANKLE_PITCH() {
    return this.getServoAngle('LEFT_ANKLE_PITCH')
  }

  @computed
  get RIGHT_ANKLE_ROLL() {
    return this.getServoAngle('RIGHT_ANKLE_ROLL')
  }

  @computed
  get LEFT_ANKLE_ROLL() {
    return this.getServoAngle('LEFT_ANKLE_ROLL')
  }

  @computed
  get HEAD_YAW() {
    return this.getServoAngle('HEAD_YAW')
  }

  @computed
  get HEAD_PITCH() {
    return this.getServoAngle('HEAD_PITCH')
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
