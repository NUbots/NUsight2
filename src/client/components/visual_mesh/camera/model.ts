import { observable } from 'mobx'

import { Image } from '../../../image_decoder/image_decoder'
import { Matrix4 } from '../../../math/matrix4'
import { VisualMeshRobotModel } from '../model'

export interface VisualMesh {
  readonly rows: number[]
  readonly indices: number[]
  readonly neighbours: number[][]
  readonly coordinates: Array<[number, number]>
  readonly classifications: Array<{ dim: number, values: number[] }>
}

type CameraModelOpts = {
  id: number
  name: string
}

export class CameraModel {
  readonly id: number

  @observable.shallow mesh?: VisualMesh
  @observable.shallow image?: Image
  @observable name: string

  constructor(private model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    this.id = id
    this.name = name
  }

  static of(model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    return new CameraModel(model, { id, name })
  }
}
