import { observable } from 'mobx'

import { Matrix4 } from '../../../math/matrix4'
import { VisionRobotModel } from '../model'

export class ImageModel {
  @observable width: number
  @observable height: number
  @observable format: number
  @observable.ref data: Uint8Array
  @observable Hcw: Matrix4

  constructor(width: number, height: number, format: number, data: Uint8Array, Hcw: Matrix4) {
    this.width = width
    this.height = height
    this.format = format
    this.data = data
    this.Hcw = Hcw
  }

  static of({ width, height, format, data, Hcw }:
    { width: number, height: number, format: number, data: Uint8Array, Hcw: Matrix4}) {
    return new ImageModel(width, height, format, data, Hcw)
  }
}

export class CameraModel {

  private model: VisionRobotModel
  readonly id: number

  @observable image?: ImageModel
  @observable name: string

  constructor(model: VisionRobotModel, id: number, name: string) {
    this.model = model
    this.id = id
    this.name = name
  }

  static of({ model, id, name }: { model: VisionRobotModel, id: number, name: string }) {
    return new CameraModel(model, id, name)
  }
}
