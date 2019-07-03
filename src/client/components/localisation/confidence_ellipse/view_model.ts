import { computed } from 'mobx'
import * as THREE from 'three'
import { Color } from 'three'
import { CircleGeometry } from 'three'
import { disposableComputed } from '../../../base/disposable_computed'
import { Matrix4 } from '../../../math/matrix4'
import { Quaternion } from '../../../math/quaternion'
import { Vector3 } from '../../../math/vector3'
import { meshBasicMaterial } from '../../three/builders'
import { mesh } from '../../three/builders'
import { LocalisationRobotModel } from '../darwin_robot/model'
import { ConfidenceEllipse } from '../darwin_robot/model'

export class ConfidenceEllipseViewModel {
  constructor(
    private readonly model: ConfidenceEllipse,
    private readonly robot: LocalisationRobotModel,
  ) {
  }

  static of(model: ConfidenceEllipse, robot: LocalisationRobotModel) {
    return new ConfidenceEllipseViewModel(model, robot)
  }

  readonly confidenceEllipse = mesh(() => ({
    geometry: this.ellipseGeometry.get(),
    material: this.ellipseMaterial.get(),
    position: this.ellipsePosition,
    scale: new Vector3(
      this.model.scaleX,
      this.model.scaleY,
      1,
    ),
    rotation: new Vector3(0, 0, this.model.rotation),
  }))

  @computed
  get ellipsePosition() {
    // debugger
    const rWTw = toThreeVector3(this.robot.rTWw);//.applyQuaternion(toThreeQuaternion(this.robot.Rwt))
    // rWTw.multiplyScalar(-1)
    const rTFf = rWTw.applyMatrix4(toThreeMatrix4(this.robot.Hfw))
    return new Vector3(rTFf.x, rTFf.y, 0)
    // Htw * Hwf
    // world -> field
    // Htf

    // Hfw * Rwt * rWTt

    // Rwt * rWTt -> rWTw
    // Hfw * rWTw -> r

    // rTFf with z = 0
    // return new Vector3(0.5, 0, 0)
  }

  readonly ellipseMaterial = meshBasicMaterial(() => ({
    color: new Color('purple'),
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: 1,
  }))

  readonly ellipseGeometry = disposableComputed(() => new CircleGeometry(1, 50))
}

function toThreeVector3(vec3: Vector3): THREE.Vector3 {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z)
}

function toThreeMatrix4(mat4: Matrix4): THREE.Matrix4 {
  return new THREE.Matrix4().set(
    mat4.x.x, mat4.y.x, mat4.z.x, mat4.t.x,
    mat4.x.y, mat4.y.y, mat4.z.y, mat4.t.y,
    mat4.x.z, mat4.y.z, mat4.z.z, mat4.t.z,
    mat4.x.t, mat4.y.t, mat4.z.t, mat4.t.t,
  )
}

function toThreeQuaternion(quat: Quaternion): THREE.Quaternion {
  return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w)
}
