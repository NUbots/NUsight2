import { observable } from 'mobx'

import { Matrix4 } from '../../../math/matrix4'
import { VisionRobotModel } from '../model'

export type VisionImage = {
  width: number,
  height: number,
  data: Uint8Array,
  format: number
}

export class CameraModel {

  private model: VisionRobotModel
  readonly id: number

  @observable.shallow image?: VisionImage
  @observable Hcw: Matrix4 = Matrix4.of()
  @observable name: string = ''

  constructor(model: VisionRobotModel, id: number) {
    this.model = model
    this.id = id
  }

  static of(opts: {
    model: VisionRobotModel
    id: number}) {
    return new CameraModel(opts.model, opts.id)
  }
}
