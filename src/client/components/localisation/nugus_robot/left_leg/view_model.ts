import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as LeftFootConfig from './config/left_foot.json'
import * as LeftPelvisConfig from './config/left_hip.json'
import * as LeftLowerLegConfig from './config/lower_left_leg.json'
import * as LeftUpperLegConfig from './config/upper_left_leg.json'

export class LeftLegViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): LeftLegViewModel => {
    return new LeftLegViewModel(model)
  })

  @computed
  get leftLeg() {
    const leftLeg = new Object3D()
    leftLeg.add(this.leftPelvis)
    return leftLeg
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
  private get leftFootGeometryAndMaterial() {
    return geometryAndMaterial(LeftFootConfig, this.model.color)
  }
}
