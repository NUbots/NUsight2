import { observable } from 'mobx'

import { ImageModel } from '../../../image_decoder/image_decoder'
import { Matrix4 } from '../../../math/matrix4'
import { VisualMeshRobotModel } from '../model'


type MeshModelOpts = {
  rows: number[]
  indices: number[]
  neighbours: number[][]
  coordinates: Array<[number, number]>
  classifications: Array<{ dim: number, values: number[] }>
}

export class MeshModel {
  @observable.ref rows: number[]
  @observable.ref indices: number[]
  @observable.ref neighbours: number[][]
  @observable.ref coordinates: Array<[number, number]>
  @observable.ref classifications: Array<{ dim: number, values: number[] }>

  constructor({ rows, indices, neighbours, coordinates, classifications }: MeshModelOpts) {
    this.rows = rows
    this.indices = indices
    this.neighbours = neighbours
    this.classifications = classifications
    this.coordinates = coordinates
  }

  static of() {
    return new MeshModel({
      rows: [],
      indices: [],
      neighbours: [],
      coordinates: [],
      classifications: [],
    })
  }
}

type CameraModelOpts = {
  id: number
  name: string
}

export class CameraModel {
  readonly id: number

  @observable.shallow mesh?: MeshModel
  @observable.shallow image?: ImageModel
  @observable name: string

  constructor(private model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    this.id = id
    this.name = name
  }

  static of(model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    return new CameraModel(model, { id, name })
  }
}
