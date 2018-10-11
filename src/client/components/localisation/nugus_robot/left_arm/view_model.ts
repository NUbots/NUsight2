import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as LeftShoulderConfig from './config/left_shoulder.json'
import * as LeftLowerArmConfig from './config/lower_left_arm.json'
import * as LeftUpperArmConfig from './config/upper_left_arm.json'

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
    mesh.position.set(-0.06, 0.05, -0.034)
    mesh.rotation.set(this.model.motors.leftShoulderPitch.angle + Math.PI / 4, 0, Math.PI)
    mesh.add(this.leftUpperArm)
    return mesh
  }

  @computed
  private get leftUpperArm() {
    const { geometry, materials } = this.leftUpperArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(-0.43, 0, -0.09)
    mesh.rotation.set(Math.PI / 2, 0, this.model.motors.leftShoulderRoll.angle)
    mesh.add(this.leftLowerArm)
    return mesh
  }

  @computed
  private get leftLowerArm() {
    const { geometry, materials } = this.leftLowerArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0.43, 0.2)
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
