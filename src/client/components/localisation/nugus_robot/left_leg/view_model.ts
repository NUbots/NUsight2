import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

// import * as LeftAnkleConfig from './config/left_ankle.json'
import * as LeftFootConfig from './config/LeftFoot.json'
import * as LeftPelvisConfig from './config/LeftHip.json'
import * as LeftLowerLegConfig from './config/LeftLowerLeg.json'
// import * as LeftPelvisYConfig from './config/left_pelvis_y.json'
import * as LeftUpperLegConfig from './config/LeftUpperLeg.json'

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
    mesh.rotation.set(0, 0, this.model.motors.leftHipRoll.angle)
    mesh.position.set(120, -338, 20)
    // mesh.add(this.leftUpperLeg)
    return mesh
  }

  @computed
  private get leftUpperLeg() {
    const { geometry, materials } = this.leftUpperLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.rotation.set(this.model.motors.leftHipPitch.angle, 0, 0)
    mesh.add(this.leftLowerLeg)
    return mesh
  }

  @computed
  private get leftLowerLeg() {
    const { geometry, materials } = this.leftLowerLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, -0.093, 0)
    mesh.rotation.set(this.model.motors.leftKnee.angle, 0, 0)
    mesh.add(this.leftFoot)
    return mesh
  }

  @computed
  private get leftFoot() {
    const { geometry, materials } = this.leftFootGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.rotation.set(0, 0, this.model.motors.leftAnkleRoll.angle)
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
