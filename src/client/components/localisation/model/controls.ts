import { observable } from 'mobx'

export class ControlsModel {
  @observable public forward: boolean
  @observable public left: boolean
  @observable public right: boolean
  @observable public back: boolean
  @observable public up: boolean
  @observable public down: boolean
  @observable public pitch: number
  @observable public yaw: number

  constructor(opts: ControlsModel) {
    Object.assign(this, opts)
  }

  public static of() {
    return new ControlsModel({
      forward: false,
      left: false,
      right: false,
      back: false,
      up: false,
      down: false,
      pitch: 0,
      yaw: 0,
    })
  }
}
