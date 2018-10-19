import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as RightLowerLegConfig from './config/lower_right_leg.json'
import * as RightFootConfig from './config/right_foot.json'
import * as RightPelvisConfig from './config/right_hip.json'
import * as RightUpperLegConfig from './config/upper_right_leg.json'

export class RightLegViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): RightLegViewModel => {
    return new RightLegViewModel(model)
  })

  @computed
  get rightLeg() {
    const rightLeg = new Object3D()
    rightLeg.add(this.rightPelvis)
    return rightLeg
  }

  @computed
  private get rightPelvis() {
    const { geometry, materials } = this.rightPelvisGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0.01, 0.032)
    mesh.rotation.set(0, 0, -Math.PI / 2)
    mesh.add(this.rightUpperLeg)
    return mesh
  }

  @computed
  private get rightUpperLeg() {
    const { geometry, materials } = this.rightUpperLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.04, 0, 0.006)
    mesh.rotation.set(0, 0, 0)
    mesh.add(this.rightLowerLeg)
    return mesh
  }

  @computed
  private get rightLowerLeg() {
    const { geometry, materials } = this.rightLowerLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.16, 0, 0)
    mesh.rotation.set(0, 0, 0)
    // mesh.rotation.set(this.model.motors.rightKnee.angle + 3 * Math.PI / 4, 0, 0)
    mesh.add(this.rightFoot)
    return mesh
  }

  @computed
  private get rightFoot() {
    const { geometry, materials } = this.rightFootGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.16, 0, 0)
    mesh.rotation.set(Math.PI, Math.PI, this.model.motors.rightAnkleRoll.angle - Math.PI / 2)
    return mesh
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
  private get rightFootGeometryAndMaterial() {
    return geometryAndMaterial(RightFootConfig, this.model.color)
  }
}
