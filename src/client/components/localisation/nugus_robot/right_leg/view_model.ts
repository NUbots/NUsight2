import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as RightAnkleConfig from './config/right_ankle.json'
import * as RightFootConfig from './config/right_foot.json'
import * as RightPelvisConfig from './config/right_hip_roll.json'
import * as RightPelvisYConfig from './config/right_hip_yaw.json'
import * as RightLowerLegConfig from './config/right_shank.json'
import * as RightUpperLegConfig from './config/right_thigh.json'

export class RightLegViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): RightLegViewModel => {
    return new RightLegViewModel(model)
  })

  @computed
  get rightLeg() {
    const rightLeg = new Object3D()
    rightLeg.add(this.rightPelvisY)
    return rightLeg
  }

  @computed
  private get rightPelvisY() {
    const { geometry, materials } = this.rightPelvisYGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.06, 0.06, -0.58)
    mesh.rotation.set(Math.PI, this.model.motors.rightHipYaw.angle, 0)
    mesh.add(this.rightPelvis)
    return mesh
  }

  @computed
  private get rightPelvis() {
    const { geometry, materials } = this.rightPelvisGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.01, 0.05, -0.3)
    mesh.rotation.set(0, 0, this.model.motors.rightHipRoll.angle)
    mesh.add(this.rightUpperLeg)
    return mesh
  }

  @computed
  private get rightUpperLeg() {
    const { geometry, materials } = this.rightUpperLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.06, 0, -0.1)
    mesh.rotation.set(this.model.motors.rightHipPitch.angle, Math.PI, 0)
    mesh.add(this.rightLowerLeg)
    return mesh
  }

  @computed
  private get rightLowerLeg() {
    const { geometry, materials } = this.rightLowerLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, -0.33)
    mesh.rotation.set(this.model.motors.rightKnee.angle + 3 * Math.PI / 4, 0, 0)
    mesh.add(this.rightAnkle)
    return mesh
  }

  @computed
  private get rightAnkle() {
    const { geometry, materials } = this.rightAnkleGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.05, -0.02, 0.12)
    mesh.rotation.set(this.model.motors.rightAnklePitch.angle, 0, Math.PI / 2)
    mesh.add(this.rightFoot)
    return mesh
  }

  @computed
  private get rightFoot() {
    const { geometry, materials } = this.rightFootGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.03, 0.06, -0.1)
    mesh.rotation.set(0, 0, this.model.motors.rightAnkleRoll.angle - Math.PI / 2)
    return mesh
  }

  @computed
  private get rightPelvisYGeometryAndMaterial() {
    return geometryAndMaterial(RightPelvisYConfig, this.model.color)
  }

  @computed
  private get rightPelvisGeometryAndMaterial() {
    return geometryAndMaterial(RightPelvisConfig, this.model.color)
  }

  @computed
  private get rightUpperLegGeometryAndMaterial() {
    return geometryAndMaterial(RightUpperLegConfig, this.model.color)
  }

  @computed
  private get rightLowerLegGeometryAndMaterial() {
    return geometryAndMaterial(RightLowerLegConfig, this.model.color)
  }

  @computed
  private get rightAnkleGeometryAndMaterial() {
    return geometryAndMaterial(RightAnkleConfig, this.model.color)
  }

  @computed
  private get rightFootGeometryAndMaterial() {
    return geometryAndMaterial(RightFootConfig, this.model.color)
  }
}
