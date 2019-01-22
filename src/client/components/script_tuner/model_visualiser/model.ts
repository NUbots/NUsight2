import { Quaternion } from '../../../math/quaternion'
import { Vector3 } from '../../../math/vector3'

export interface Robot3dViewModel {
  color?: string,
  rWTt: Vector3, // Torso to world translation in torso space.
  Rwt: Quaternion, // Torso to world rotation.
  rightShoulderPitch: number,
  leftShoulderPitch: number,
  rightShoulderRoll: number,
  leftShoulderRoll: number,
  rightElbow: number,
  leftElbow: number,
  rightHipYaw: number,
  leftHipYaw: number,
  rightHipRoll: number,
  leftHipRoll: number,
  rightHipPitch: number,
  leftHipPitch: number,
  rightKnee: number,
  leftKnee: number,
  rightAnklePitch: number,
  leftAnklePitch: number,
  rightAnkleRoll: number,
  leftAnkleRoll: number,
  headPan: number,
  headTilt: number,
}
