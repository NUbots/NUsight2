import { observable } from 'mobx'
import { DarwinMotor } from './darwin_motor'

export class DarwinMotorSet {
  @observable public rightShoulderPitch: DarwinMotor
  @observable public leftShoulderPitch: DarwinMotor
  @observable public rightShoulderRoll: DarwinMotor
  @observable public leftShoulderRoll: DarwinMotor
  @observable public rightElbow: DarwinMotor
  @observable public leftElbow: DarwinMotor
  @observable public rightHipYaw: DarwinMotor
  @observable public leftHipYaw: DarwinMotor
  @observable public rightHipRoll: DarwinMotor
  @observable public leftHipRoll: DarwinMotor
  @observable public rightHipPitch: DarwinMotor
  @observable public leftHipPitch: DarwinMotor
  @observable public rightKnee: DarwinMotor
  @observable public leftKnee: DarwinMotor
  @observable public rightAnklePitch: DarwinMotor
  @observable public leftAnklePitch: DarwinMotor
  @observable public rightAnkleRoll: DarwinMotor
  @observable public leftAnkleRoll: DarwinMotor
  @observable public headPan: DarwinMotor
  @observable public headTilt: DarwinMotor

  public constructor(opts: DarwinMotorSet) {
    Object.assign(this, opts)
  }

  public static of() {
    return new DarwinMotorSet({
      rightShoulderPitch: DarwinMotor.of(),
      leftShoulderPitch: DarwinMotor.of(),
      rightShoulderRoll: DarwinMotor.of(),
      leftShoulderRoll: DarwinMotor.of(),
      rightElbow: DarwinMotor.of(),
      leftElbow: DarwinMotor.of(),
      rightHipYaw: DarwinMotor.of(),
      leftHipYaw: DarwinMotor.of(),
      rightHipRoll: DarwinMotor.of(),
      leftHipRoll: DarwinMotor.of(),
      rightHipPitch: DarwinMotor.of(),
      leftHipPitch: DarwinMotor.of(),
      rightKnee: DarwinMotor.of(),
      leftKnee: DarwinMotor.of(),
      rightAnklePitch: DarwinMotor.of(),
      leftAnklePitch: DarwinMotor.of(),
      rightAnkleRoll: DarwinMotor.of(),
      leftAnkleRoll: DarwinMotor.of(),
      headPan: DarwinMotor.of(),
      headTilt: DarwinMotor.of(),
    })
  }
}
