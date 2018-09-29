import { observable } from 'mobx'
import { computed } from 'mobx'

import { memoize } from '../../../base/memoize'
import { Quaternion } from '../../../math/quaternion'
import { Vector3 } from '../../../math/vector3'
import { RobotModel } from '../../robot/model'

class NugusMotor {
  @observable angle: number

  constructor({ angle }: NugusMotor) {
    this.angle = angle
  }

  static of() {
    return new NugusMotor({ angle: 0 })
  }
}

export class NugusMotorSet {
  @observable rightShoulderPitch: NugusMotor
  @observable leftShoulderPitch: NugusMotor
  @observable rightShoulderRoll: NugusMotor
  @observable leftShoulderRoll: NugusMotor
  @observable rightElbow: NugusMotor
  @observable leftElbow: NugusMotor
  @observable rightHipYaw: NugusMotor
  @observable leftHipYaw: NugusMotor
  @observable rightHipRoll: NugusMotor
  @observable leftHipRoll: NugusMotor
  @observable rightHipPitch: NugusMotor
  @observable leftHipPitch: NugusMotor
  @observable rightKnee: NugusMotor
  @observable leftKnee: NugusMotor
  @observable rightAnklePitch: NugusMotor
  @observable leftAnklePitch: NugusMotor
  @observable rightAnkleRoll: NugusMotor
  @observable leftAnkleRoll: NugusMotor
  @observable headPan: NugusMotor
  @observable headTilt: NugusMotor

  constructor({
    rightShoulderPitch,
    leftShoulderPitch,
    rightShoulderRoll,
    leftShoulderRoll,
    rightElbow,
    leftElbow,
    rightHipYaw,
    leftHipYaw,
    rightHipRoll,
    leftHipRoll,
    rightHipPitch,
    leftHipPitch,
    rightKnee,
    leftKnee,
    rightAnklePitch,
    leftAnklePitch,
    rightAnkleRoll,
    leftAnkleRoll,
    headPan,
    headTilt,
  }: NugusMotorSet) {
    this.rightShoulderPitch = rightShoulderPitch
    this.leftShoulderPitch = leftShoulderPitch
    this.rightShoulderRoll = rightShoulderRoll
    this.leftShoulderRoll = leftShoulderRoll
    this.rightElbow = rightElbow
    this.leftElbow = leftElbow
    this.rightHipYaw = rightHipYaw
    this.leftHipYaw = leftHipYaw
    this.rightHipRoll = rightHipRoll
    this.leftHipRoll = leftHipRoll
    this.rightHipPitch = rightHipPitch
    this.leftHipPitch = leftHipPitch
    this.rightKnee = rightKnee
    this.leftKnee = leftKnee
    this.rightAnklePitch = rightAnklePitch
    this.leftAnklePitch = leftAnklePitch
    this.rightAnkleRoll = rightAnkleRoll
    this.leftAnkleRoll = leftAnkleRoll
    this.headPan = headPan
    this.headTilt = headTilt
  }

  static of() {
    return new NugusMotorSet({
      rightShoulderPitch: NugusMotor.of(),
      leftShoulderPitch: NugusMotor.of(),
      rightShoulderRoll: NugusMotor.of(),
      leftShoulderRoll: NugusMotor.of(),
      rightElbow: NugusMotor.of(),
      leftElbow: NugusMotor.of(),
      rightHipYaw: NugusMotor.of(),
      leftHipYaw: NugusMotor.of(),
      rightHipRoll: NugusMotor.of(),
      leftHipRoll: NugusMotor.of(),
      rightHipPitch: NugusMotor.of(),
      leftHipPitch: NugusMotor.of(),
      rightKnee: NugusMotor.of(),
      leftKnee: NugusMotor.of(),
      rightAnklePitch: NugusMotor.of(),
      leftAnklePitch: NugusMotor.of(),
      rightAnkleRoll: NugusMotor.of(),
      leftAnkleRoll: NugusMotor.of(),
      headPan: NugusMotor.of(),
      headTilt: NugusMotor.of(),
    })
  }
}

export class LocalisationRobotModel {
  @observable private model: RobotModel
  @observable name: string
  @observable color?: string
  @observable rWTt: Vector3 // Torso to world translation in torso space.
  @observable Rwt: Quaternion // Torso to world rotation.
  @observable motors: NugusMotorSet

  constructor({ model, name, color, rWTt, Rwt, motors }: {
    model: RobotModel,
    name: string,
    color?: string,
    rWTt: Vector3,
    Rwt: Quaternion,
    motors: NugusMotorSet
  }) {
    this.model = model
    this.name = name
    this.color = color
    this.rWTt = rWTt
    this.Rwt = Rwt
    this.motors = motors
  }

  static of = memoize((model: RobotModel): LocalisationRobotModel => {
    return new LocalisationRobotModel({
      model,
      name: model.name,
      rWTt: Vector3.of(),
      Rwt: Quaternion.of(),
      motors: NugusMotorSet.of(),
    })
  })

  @computed get visible() {
    return this.model.enabled
  }
}
