import { observable } from 'mobx'
import { Vector3 } from './vector'

export class CameraModel {
  @observable public position: Vector3
  @observable public yaw: number
  @observable public pitch: number
  @observable public distance: number

  constructor(opts: CameraModel) {
    Object.assign(this, opts)
  }

  public static of() {
    return new CameraModel({
      position: Vector3.of(),
      yaw: 0,
      pitch: 0,
      distance: 0.5,
    })
  }
}
