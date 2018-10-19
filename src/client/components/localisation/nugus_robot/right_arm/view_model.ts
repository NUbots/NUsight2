import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as RightLowerArmConfig from './config/lower_right_arm.json'
import * as RightShoulderConfig from './config/right_shoulder.json'
import * as RightUpperArmConfig from './config/upper_right_arm.json'

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
    mesh.position.set(0, 0.18125, 0.075)
    mesh.rotation.set(-Math.PI / 2, -this.model.motors.rightShoulderPitch.angle, -Math.PI / 2)
    mesh.add(this.rightUpperArm)
    return mesh
  }

  @computed
  private get rightUpperArm() {
    const { geometry, materials } = this.rightUpperArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.0475, 0, 0)
    mesh.rotation.set(7 * Math.PI / 16 + this.model.motors.rightShoulderRoll.angle, 5 * Math.PI / 8, Math.PI)
    mesh.add(this.rightLowerArm)
    return mesh
  }

  @computed
  private get rightLowerArm() {
    const { geometry, materials } = this.rightLowerArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0.16, 0, 0)
    mesh.rotation.set(Math.PI, 0, Math.PI / 4 + this.model.motors.rightElbow.angle)
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
