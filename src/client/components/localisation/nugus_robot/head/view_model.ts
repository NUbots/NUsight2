import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as HeadConfig from './config/head.json'
import * as NeckConfig from './config/neck.json'

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
    const { geometry, materials } = this.neckGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0.051, 0.08)
    mesh.rotation.set(0, this.model.motors.headPan.angle, this.model.motors.headTilt.angle)
    mesh.add(this.skull)
    return mesh
  }

  @computed
  private get skull() {
    const { geometry, materials } = this.skullGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.rotation.set(this.model.motors.headTilt.angle, 0, 0)
    return mesh
  }

  @computed
  private get neckGeometryAndMaterial() {
    return geometryAndMaterial(NeckConfig, this.model.color)
  }

  @computed
  private get skullGeometryAndMaterial() {
    return geometryAndMaterial(HeadConfig, this.model.color)
  }
}
