import { observable } from 'mobx'

import { Matrix4 } from '../../../math/matrix4'
import { VisionRobotModel } from '../model'

export class CameraModel {

  private model: VisionRobotModel
  readonly id: number

  @observable width: number = 1280
  @observable height: number = 1024
  @observable format: number = 0
  @observable.ref data: Uint8Array
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