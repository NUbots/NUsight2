import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../utils'
import { LocalisationRobotModel } from '../model'

import * as HeadConfig from './config/head.json'

export class HeadViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): HeadViewModel => {
    return new HeadViewModel(model)
  })

  @computed
  get head() {
    const head = new Object3D()
    head.add(this.skull)
    return head
  }

  @computed
  private get skull() {
    const { geometry, materials } = this.skullGeometryAndMaterial
    const mesh = new Mesh(geometry, materials)
    mesh.position.set(0, 0.19, 0)
    mesh.rotation.set(0, 0, this.model.motors.headPan.angle)
    return mesh
  }

  @computed
  private get skullGeometryAndMaterial() {
    return geometryAndMaterial(HeadConfig, this.model.color)
  }
}
