import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as LeftLowerArmConfig from './config/LeftLowerArm.json'
import * as LeftShoulderConfig from './config/LeftShoulder.json'
import * as LeftUpperArmConfig from './config/LeftUpperArm.json'

export class LeftArmViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): LeftArmViewModel => {
    return new LeftArmViewModel(model)
  })

  @computed
  get leftArm() {
    const leftArm = new Object3D()
    leftArm.add(this.leftShoulder)
    return leftArm
  }

  @computed
  private get leftShoulder() {
    const { geometry, materials } = this.leftShoulderGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(60, 180, 50)
    mesh.rotation.set(this.model.motors.leftShoulderPitch.angle - 3 * Math.PI / 4, 0, 0)
    mesh.add(this.leftUpperArm)
    return mesh
  }

  @computed
  private get leftUpperArm() {
    const { geometry, materials } = this.leftUpperArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-188, -10, 0)
    mesh.rotation.set(Math.PI / 2, 0, this.model.motors.leftShoulderRoll.angle - Math.PI / 8)
    mesh.add(this.leftLowerArm)
    return mesh
  }

  @computed
  private get leftLowerArm() {
    const { geometry, materials } = this.leftLowerArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, -80, 285)
    mesh.rotation.set(this.model.motors.leftElbow.angle, 0, 0)
    return mesh
  }

  @computed
  private get leftShoulderGeometryAndMaterial() {
    return geometryAndMaterial(LeftShoulderConfig, this.model.color)
  }

  @computed
  private get leftUpperArmGeometryAndMaterial() {
    return geometryAndMaterial(LeftUpperArmConfig, this.model.color)
  }

  @computed
  private get leftLowerArmGeometryAndMaterial() {
    return geometryAndMaterial(LeftLowerArmConfig, this.model.color)
  }
}
