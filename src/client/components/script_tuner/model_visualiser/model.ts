import { Quaternion } from '../../../math/quaternion'
import { Vector3 } from '../../../math/vector3'

export interface Robot3dViewModel {
  color?: string,
  rWTt: Vector3, // Torso to world translation in torso space.
  Rwt: Quaternion, // Torso to world rotation.
  RIGHT_SHOULDER_PITCH: number,
  LEFT_SHOULDER_PITCH: number,
  RIGHT_SHOULDER_ROLL: number,
  LEFT_SHOULDER_ROLL: number,
  RIGHT_ELBOW: number,
  LEFT_ELBOW: number,
  RIGHT_HIP_YAW: number,
  LEFT_HIP_YAW: number,
  RIGHT_HIP_ROLL: number,
  LEFT_HIP_ROLL: number,
  RIGHT_HIP_PITCH: number,
  LEFT_HIP_PITCH: number,
  RIGHT_KNEE: number,
  LEFT_KNEE: number,
  RIGHT_ANKLE_PITCH: number,
  LEFT_ANKLE_PITCH: number,
  RIGHT_ANKLE_ROLL: number,
  LEFT_ANKLE_ROLL: number,
  HEAD_YAW: number,
  HEAD_PITCH: number,
}
