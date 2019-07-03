import { computed } from 'mobx'
import * as THREE from 'three'
import { lazyObservable } from 'mobx-utils'
import { createTransformer } from 'mobx-utils'
import { Euler } from 'three'
import { Quaternion } from 'three'
import { Mesh } from 'three'
import { Object3D } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Matrix4 } from '../../../math/matrix4'
import { Vector3 } from '../../../math/vector3'
import { Vector4 } from '../../../math/vector4'

import { LocalisationRobotModel } from '../darwin_robot/model'

import * as url from './config/nugus.glb'

export class NUgusViewModel {
  constructor(private readonly model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel) => {
    return new NUgusViewModel(model)
  })

  @computed({ equals: () => false })
  get robot(): Object3D {
    const robot = this.robotObject
    if (!robot) {
      // Model has not loaded yet, show a dummy object until it loads.
      return this.dummyObject
    }
    const motors = this.model.motors
    // TODO (Annable): Baking the offsets into the model geometries would be ideal.
    const PI = Math.PI
    const PI_2 = PI / 2
    robot.position.copy(toThreeVector3(this.model.rTWw).applyMatrix4(toThreeMatrix4(this.model.Hfw)))
    const rotation = new Quaternion(this.model.Rwt.x, this.model.Rwt.y, this.model.Rwt.z, this.model.Rwt.w)
    rotation.multiply(new Quaternion().setFromEuler(new Euler(PI_2, 0, 0)))
    robot.setRotationFromQuaternion(rotation)
    findMesh(robot, 'R_Shoulder').rotation.set(0, 0, PI_2 - motors.rightShoulderPitch.angle)
    findMesh(robot, 'L_Shoulder').rotation.set(0, 0, -PI_2 - motors.leftShoulderPitch.angle)
    findMesh(robot, 'R_Arm_Upper').rotation.set(0, PI_2, motors.rightShoulderRoll.angle)
    findMesh(robot, 'L_Arm_Upper').rotation.set(0, PI_2, -motors.leftShoulderRoll.angle)
    findMesh(robot, 'R_Arm_Lower').rotation.set(motors.rightElbow.angle, 0, 0)
    findMesh(robot, 'L_Arm_Lower').rotation.set(motors.leftElbow.angle, 0, 0)
    findMesh(robot, 'R_Hip_Yaw').rotation.set(0, motors.rightHipYaw.angle - PI_2, -PI_2)
    findMesh(robot, 'L_Hip_Yaw').rotation.set(0, PI_2 + motors.leftHipYaw.angle, -PI_2)
    findMesh(robot, 'R_Hip').rotation.set(0, 0, PI_2 - motors.rightHipRoll.angle)
    findMesh(robot, 'L_Hip').rotation.set(0, 0, motors.leftHipRoll.angle - PI_2)
    findMesh(robot, 'R_Upper_Leg').rotation.set(-motors.rightHipPitch.angle, 0, PI)
    findMesh(robot, 'L_Upper_Leg').rotation.set(-motors.leftHipPitch.angle, 0, PI)
    findMesh(robot, 'R_Lower_Leg').rotation.set(motors.rightKnee.angle, 0, 0)
    findMesh(robot, 'L_Lower_Leg').rotation.set(motors.leftKnee.angle, 0, 0)
    findMesh(robot, 'R_Ankle').rotation.set(motors.rightAnklePitch.angle, 0, 0)
    findMesh(robot, 'L_Ankle').rotation.set(motors.leftAnklePitch.angle, 0, 0)
    findMesh(robot, 'R_Foot').rotation.set(0, 0, -motors.rightAnkleRoll.angle)
    findMesh(robot, 'L_Foot').rotation.set(0, 0, motors.leftAnkleRoll.angle)
    findMesh(robot, 'Neck').rotation.set(0, PI + motors.headPan.angle, 0)
    findMesh(robot, 'Head').rotation.set(0, 0, motors.headTilt.angle)
    return robot
  }

  @computed
  private get robotObject() {
    const current = NUgusViewModel.robotObjectBase.current()
    return current
      ? current.clone() // Clone so that each view model instance has its own copy that it may mutate.
      : undefined
  }

  private static robotObjectBase = lazyObservable<Object3D | undefined>(sink => {
    new GLTFLoader().load(url, gltf => {
      // TODO (Annable): Baking this rotation into the model geometry would be ideal.
      findMesh(gltf.scene, 'Head').geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI / 2))
      sink(findMesh(gltf.scene, 'Torso'))
    })
  })

  @computed
  get dummyObject() {
    return new Object3D()
  }
}

const findMesh = (root: Object3D, name: string): Mesh => {
  const object = root.getObjectByName(name)
  if (!object || !(object instanceof Mesh)) {
    throw new Error()
  }
  return object
}

function toThreeMatrix4(mat4: Matrix4): THREE.Matrix4 {
  return new THREE.Matrix4().set(
    mat4.x.x, mat4.y.x, mat4.z.x, mat4.t.x,
    mat4.x.y, mat4.y.y, mat4.z.y, mat4.t.y,
    mat4.x.z, mat4.y.z, mat4.z.z, mat4.t.z,
    mat4.x.t, mat4.y.t, mat4.z.t, mat4.t.t,
  )
}

function fromThreeMatrix4(mat4: THREE.Matrix4): Matrix4 {
  return new Matrix4(
    new Vector4(mat4.elements[0], mat4.elements[1], mat4.elements[2], mat4.elements[3]),
    new Vector4(mat4.elements[4], mat4.elements[5], mat4.elements[6], mat4.elements[7]),
    new Vector4(mat4.elements[8], mat4.elements[9], mat4.elements[10], mat4.elements[11]),
    new Vector4(mat4.elements[12], mat4.elements[13], mat4.elements[14], mat4.elements[15]),
  )
}

function toThreeVector3(vec3: Vector3): THREE.Vector3 {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z)
}

function fromThreeVector3(vec3: THREE.Vector3): Vector3 {
  return new Vector3(vec3.x, vec3.y, vec3.z)
}
