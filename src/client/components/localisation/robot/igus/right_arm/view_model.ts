import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { LocalisationRobotModel } from '../../model'

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
    rightArm.add(this.rightShoulderServo)
    return rightArm
  }

  @computed
  private get rightShoulderServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0.18125, 0.075)
    mesh.add(this.rightShoulderAxis)
    return mesh
  }

  @computed
  private get rightShoulderAxis() {
    const mesh = new Mesh()
    mesh.rotation.set(0, 0, -this.model.motors.rightShoulderPitch.angle)
    mesh.add(this.rightShoulder)
    return mesh
  }

  @computed
  private get rightShoulder() {
    const { geometry, materials } = this.rightShoulderGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.add(this.rightUpperArmServo)
    return mesh
  }

  @computed
  private get rightUpperArmServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0, 0.0475)
    mesh.add(this.rightUpperArmAxis)
    return mesh
  }

  @computed
  private get rightUpperArmAxis() {
    const mesh = new Mesh()
    mesh.rotation.set(-this.model.motors.rightShoulderRoll.angle,  0, 0)
    mesh.add(this.rightUpperArm)
    return mesh
  }

  @computed
  private get rightUpperArm() {
    const { geometry, materials } = this.rightUpperArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0,  0, Math.PI / 2)
    mesh.add(this.rightLowerArmServo)
    return mesh
  }

  @computed
  private get rightLowerArmServo() {
    const mesh = new Mesh()
    mesh.position.set(0.16, 0.02, 0)
    mesh.add(this.rightLowerArmAxis)
    return mesh
  }

  @computed
  private get rightLowerArmAxis() {
    const mesh = new Mesh()
    mesh.rotation.set(0, 0, this.model.motors.rightElbow.angle)
    mesh.add(this.rightLowerArm)
    return mesh
  }

  @computed
  private get rightLowerArm() {
    const { geometry, materials } = this.rightLowerArmGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(Math.PI, 0, 3 * Math.PI / 4)
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
