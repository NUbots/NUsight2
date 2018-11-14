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
    rightLeg.add(this.rightPelvisServo)
    return rightLeg
  }

  @computed
  private get rightPelvisServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0.0125, 0.055)
    mesh.add(this.rightPelvisYawServo)
    return mesh
  }

  @computed
  private get rightPelvisYawServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, this.model.motors.rightHipYaw.angle, 0)
    mesh.add(this.rightPelvisRollServo)
    return mesh
  }

  @computed
  private get rightPelvisRollServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, this.model.motors.rightHipRoll.angle)
    mesh.add(this.rightPelvis)
    return mesh
  }

  @computed
  private get rightPelvis() {
    const { geometry, materials } = this.rightPelvisGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, Math.PI, -Math.PI / 2)
    mesh.add(this.rightUpperLegServo)
    return mesh
  }

  @computed
  private get rightUpperLegServo() {
    const mesh = new Mesh()
    mesh.position.set(0.05, 0, 0.0075)
    mesh.rotation.set(0, 0, this.model.motors.rightHipPitch.angle)
    mesh.add(this.rightUpperLeg)
    return mesh
  }

  @computed
  private get rightUpperLeg() {
    const { geometry, materials } = this.rightUpperLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(Math.PI, 0, 0)
    mesh.add(this.rightLowerLegServo)
    return mesh
  }

  @computed
  private get rightLowerLegServo() {
    const mesh = new Mesh()
    mesh.position.set(0.2, 0, 0)
    mesh.rotation.set(0, 0, -this.model.motors.rightKnee.angle)
    mesh.add(this.rightLowerLeg)
    return mesh
  }

  @computed
  private get rightLowerLeg() {
    const { geometry, materials } = this.rightLowerLegGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.add(this.rightFootServo)
    return mesh
  }

  @computed
  private get rightFootServo() {
    const mesh = new Mesh()
    mesh.position.set(0.2, 0, 0)
    mesh.rotation.set(0, 0, this.model.motors.rightAnkleRoll.angle)
    mesh.add(this.rightFoot)
    return mesh
  }

  @computed
  private get rightFoot() {
    const { geometry, materials } = this.rightFootGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, Math.PI / 2)
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
