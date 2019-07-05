import { observable } from 'mobx'

import { Image } from '../../../image_decoder/image_decoder'
import { Matrix4 } from '../../../math/matrix4'
import { Vector2 } from '../../../math/vector2'
import { VisualMeshRobotModel } from '../model'

export interface VisualMesh {
  readonly neighbours: number[]
  readonly rays: number[]
  readonly classifications: { dim: number, values: number[] }
  readonly k: number
  readonly r: number
  readonly h: number
}

export interface VisionImage extends Image {
  readonly Hcw: Matrix4
  readonly lens: {
    readonly projection: number
    readonly focalLength: number
    readonly centre: Vector2
  }
}

type CameraModelOpts = {
  id: number
  name: string
}

export class CameraModel {
  readonly id: number

  @observable.shallow mesh?: VisualMesh
  @observable.shallow image?: VisionImage
  @observable name: string

  constructor(private model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    this.id = id
    this.name = name
  }

  static of(model: VisualMeshRobotModel, { id, name }: CameraModelOpts) {
    return new CameraModel(model, { id, name })
  }
}
