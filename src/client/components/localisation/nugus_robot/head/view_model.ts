import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as HeadConfig from './config/head.json'
import * as HeadServoConfig from './config/head_servo.json'

export class HeadViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): HeadViewModel => {
    return new HeadViewModel(model)
  })

  @computed
  get head() {
    const head = new Object3D()
    head.add(this.neck)
    return head
  }

  @computed
  private get neck() {
    const mesh = new Mesh()
    mesh.position.set(0, 0.25625, 0)
    mesh.add(this.neckPanServo)
    return mesh
  }

  @computed
  private get neckPanServo() {
    const mesh = new Mesh()
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, 0)
    mesh.add(this.neckTiltServo)
    return mesh
  }

  @computed
  private get neckTiltServo() {
    const { geometry, materials } = this.headServoGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, this.model.motors.headPan.angle, 0)
    mesh.add(this.skull)
    return mesh
  }

  @computed
  private get skull() {
    const { geometry, materials } = this.skullGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, -this.model.motors.headTilt.angle)
    return mesh
  }

  @computed
  private get skullGeometryAndMaterial() {
    return geometryAndMaterial(HeadConfig, this.model.color)
  }

  @computed
  private get headServoGeometryAndMaterial() {
    return geometryAndMaterial(HeadServoConfig, this.model.color)
  }

}
