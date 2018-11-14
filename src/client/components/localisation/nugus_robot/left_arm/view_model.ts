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
    leftArm.add(this.leftShoulderServo)
    return leftArm
  }

  @computed
  private get leftShoulderServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0.18125, -0.08)
    mesh.rotation.set(0, 0, -this.model.motors.leftShoulderPitch.angle)
    mesh.add(this.leftShoulder)
    return mesh
  }

  @computed
  private get leftShoulder() {
    const { geometry, materials } = this.leftShoulderGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.add(this.leftUpperArmServo)
    return mesh
  }

  @computed
  private get leftUpperArmServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0, -0.0475)
    mesh.rotation.set(-this.model.motors.leftShoulderRoll.angle,  0, 0)
    mesh.add(this.leftUpperArm)
    return mesh
  }

  @computed
  private get leftUpperArm() {
    const { geometry, materials } = this.leftUpperArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0,  0, Math.PI / 2)
    mesh.add(this.leftLowerArmServo)
    return mesh
  }

  @computed
  private get leftLowerArmServo() {
    const mesh = new Mesh()
    mesh.position.set(0.16, 0.02, 0)
    mesh.rotation.set(0, 0, -this.model.motors.leftElbow.angle)
    mesh.add(this.leftLowerArm)
    return mesh
  }

  @computed
  private get leftLowerArm() {
    const { geometry, materials } = this.leftLowerArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, -Math.PI / 4)
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
