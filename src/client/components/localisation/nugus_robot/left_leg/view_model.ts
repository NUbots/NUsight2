import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as LeftAnkleConfig from './config/left_ankle.json'
import * as LeftFootConfig from './config/left_foot.json'
import * as LeftPelvisConfig from './config/left_hip_roll.json'
import * as LeftPelvisYConfig from './config/left_hip_yaw.json'
import * as LeftLowerLegConfig from './config/left_shank.json'
import * as LeftUpperLegConfig from './config/left_thigh.json'

export class LeftLegViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): LeftLegViewModel => {
    return new LeftLegViewModel(model)
  })

  @computed
  get leftLeg() {
    const leftLeg = new Object3D()
    leftLeg.add(this.leftPelvisY)
    return leftLeg
  }

  @computed
  private get leftPelvisY() {
    const { geometry, materials } = this.leftPelvisYGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.11, 0.06, -0.58)
    mesh.rotation.set(Math.PI, this.model.motors.leftHipYaw.angle, 0)
    mesh.add(this.leftPelvis)
    return mesh
  }

  @computed
  private get leftPelvis() {
    const { geometry, materials } = this.leftPelvisGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.rotation.set(0, Math.PI / 2, this.model.motors.leftHipRoll.angle)
    mesh.position.set(-0.07, 0.0, -0.3)
    mesh.add(this.leftUpperLeg)
    return mesh
  }

  @computed
  private get leftUpperLeg() {
    const { geometry, materials } = this.leftUpperLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.rotation.set(0, Math.PI / 2, 0)
    mesh.rotateX(this.model.motors.leftHipPitch.angle + 3 * Math.PI / 16) // global rotation
    mesh.position.set(0.1, 0.04, -0.065)
    mesh.add(this.leftLowerLeg)
    return mesh
  }

  @computed
  private get leftLowerLeg() {
    const { geometry, materials } = this.leftLowerLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, -0.33)
    mesh.rotation.set(this.model.motors.leftKnee.angle + 3 * Math.PI / 4, 0, 0)
    mesh.add(this.leftAnkle)
    return mesh
  }

  @computed
  private get leftAnkle() {
    const { geometry, materials } = this.leftAnkleGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.064, 0.02, 0.12)
    mesh.rotation.set(this.model.motors.leftAnklePitch.angle, 0, Math.PI / 2)
    mesh.add(this.leftFoot)
    return mesh
  }

  @computed
  private get leftFoot() {
    const { geometry, materials } = this.leftFootGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.03, -0.06, -0.1)
    mesh.rotation.set(0, 0, this.model.motors.leftAnkleRoll.angle - Math.PI / 2)
    return mesh
  }

  @computed
  private get leftPelvisYGeometryAndMaterial() {
    return geometryAndMaterial(LeftPelvisYConfig, this.model.color)
  }

  @computed
  private get leftPelvisGeometryAndMaterial() {
    return geometryAndMaterial(LeftPelvisConfig, this.model.color)
  }

  @computed
  private get leftUpperLegGeometryAndMaterial() {
    return geometryAndMaterial(LeftUpperLegConfig, this.model.color)
  }

  @computed
  private get leftLowerLegGeometryAndMaterial() {
    return geometryAndMaterial(LeftLowerLegConfig, this.model.color)
  }

  @computed
  private get leftAnkleGeometryAndMaterial() {
    return geometryAndMaterial(LeftAnkleConfig, this.model.color)
  }

  @computed
  private get leftFootGeometryAndMaterial() {
    return geometryAndMaterial(LeftFootConfig, this.model.color)
  }
}
