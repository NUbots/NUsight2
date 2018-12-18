import { observable } from 'mobx'
import { computed } from 'mobx'

import { memoize } from '../../../base/memoize'
import { Quaternion } from '../../../math/quaternion'
import { Vector3 } from '../../../math/vector3'
import { RobotModel } from '../../robot/model'

class RobotMotor {
  @observable angle: number

  constructor({ angle }: RobotMotor) {
    this.angle = angle
  }

  static of() {
    return new RobotMotor({ angle: 0 })
  }
}

export class RobotMotorSet {
  @observable rightShoulderPitch: RobotMotor
  @observable leftShoulderPitch: RobotMotor
  @observable rightShoulderRoll: RobotMotor
  @observable leftShoulderRoll: RobotMotor
  @observable rightElbow: RobotMotor
  @observable leftElbow: RobotMotor
  @observable rightHipYaw: RobotMotor
  @observable leftHipYaw: RobotMotor
  @observable rightHipRoll: RobotMotor
  @observable leftHipRoll: RobotMotor
  @observable rightHipPitch: RobotMotor
  @observable leftHipPitch: RobotMotor
  @observable rightKnee: RobotMotor
  @observable leftKnee: RobotMotor
  @observable rightAnklePitch: RobotMotor
  @observable leftAnklePitch: RobotMotor
  @observable rightAnkleRoll: RobotMotor
  @observable leftAnkleRoll: RobotMotor
  @observable headPan: RobotMotor
  @observable headTilt: RobotMotor

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
  }: RobotMotorSet) {
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
    return new RobotMotorSet({
      rightShoulderPitch: RobotMotor.of(),
      leftShoulderPitch: RobotMotor.of(),
      rightShoulderRoll: RobotMotor.of(),
      leftShoulderRoll: RobotMotor.of(),
      rightElbow: RobotMotor.of(),
      leftElbow: RobotMotor.of(),
      rightHipYaw: RobotMotor.of(),
      leftHipYaw: RobotMotor.of(),
      rightHipRoll: RobotMotor.of(),
      leftHipRoll: RobotMotor.of(),
      rightHipPitch: RobotMotor.of(),
      leftHipPitch: RobotMotor.of(),
      rightKnee: RobotMotor.of(),
      leftKnee: RobotMotor.of(),
      rightAnklePitch: RobotMotor.of(),
      leftAnklePitch: RobotMotor.of(),
      rightAnkleRoll: RobotMotor.of(),
      leftAnkleRoll: RobotMotor.of(),
      headPan: RobotMotor.of(),
      headTilt: RobotMotor.of(),
    })
  }
}

export class LocalisationRobotModel {
  @observable private model: RobotModel
  @observable name: string
  @observable color?: string
  @observable rWTt: Vector3 // Torso to world translation in torso space.
  @observable Rwt: Quaternion // Torso to world rotation.
  @observable motors: RobotMotorSet

  constructor({ model, name, color, rWTt, Rwt, motors }: {
    model: RobotModel,
    name: string,
    color?: string,
    rWTt: Vector3,
    Rwt: Quaternion,
    motors: RobotMotorSet
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
      motors: RobotMotorSet.of(),
    })
  })

  @computed get visible() {
    return this.model.enabled
  }
}
