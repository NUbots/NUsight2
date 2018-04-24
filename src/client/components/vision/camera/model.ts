import { observable } from 'mobx'

import { Matrix4 } from '../../../math/matrix4'
import { VisionRobotModel } from '../model'

type ImageModelOpts = {
  width: number
  height: number
  format: number
  data: Uint8Array
  lens: { projection: number, focalLength: number }
  Hcw: Matrix4
}

export class ImageModel {
  @observable width: number
  @observable height: number
  @observable format: number
  @observable.ref data: Uint8Array
  @observable lens: { projection: number, focalLength: number }
  @observable Hcw: Matrix4

  constructor({ width, height, format, data, lens, Hcw }: ImageModelOpts) {
    this.width = width
    this.height = height
    this.format = format
    this.data = data
    this.lens = lens
    this.Hcw = Hcw
  }

  static of({ width, height, format, data, lens, Hcw }: ImageModelOpts) {
    return new ImageModel({ width, height, format, data, lens, Hcw })
  }
}

type CameraModelOpts = {
  id: number
  name: string
}

export class CameraModel {
  readonly id: number

  @observable image?: ImageModel
  @observable name: string

  constructor(private model: VisionRobotModel, { id, name }: CameraModelOpts) {
    this.id = id
    this.name = name
  }

  static of(model: VisionRobotModel, { id, name }: CameraModelOpts) {
    return new CameraModel(model, { id, name })
  }
}
