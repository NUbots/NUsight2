import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as RightLowerArmConfig from './config/RightLowerArm.json'
import * as RightShoulderConfig from './config/RightShoulder.json'
import * as RightUpperArmConfig from './config/RightUpperArm.json'

export class RightArmViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): RightArmViewModel => {
    return new RightArmViewModel(model)
  })

  @computed
  get rightArm() {
    const rightArm = new Object3D()
    rightArm.add(this.rightShoulder)
    return rightArm
  }

  @computed
  private get rightShoulder() {
    const { geometry, materials } = this.rightShoulderGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.082, 0, 0)
    mesh.rotation.set(this.model.motors.rightShoulderPitch.angle - Math.PI / 2, 0, 0)
    mesh.add(this.rightUpperArm)
    return mesh
  }

  @computed
  private get rightUpperArm() {
    const { geometry, materials } = this.rightUpperArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, -0.016, 0)
    mesh.rotation.set(0, 0, this.model.motors.rightShoulderRoll.angle)
    mesh.add(this.rightLowerArm)
    return mesh
  }

  @computed
  private get rightLowerArm() {
    const { geometry, materials } = this.rightLowerArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, -0.06, 0.016)
    mesh.rotation.set(this.model.motors.rightElbow.angle, 0, 0)
    return mesh
  }

  @computed
  private get rightShoulderGeometryAndMaterial() {
    return geometryAndMaterial(RightShoulderConfig, this.model.color)
  }

  @computed
  private get rightUpperArmGeometryAndMaterial() {
    return geometryAndMaterial(RightUpperArmConfig, this.model.color)
  }

  @computed
  private get rightLowerArmGeometryAndMaterial() {
    return geometryAndMaterial(RightLowerArmConfig, this.model.color)
  }
}