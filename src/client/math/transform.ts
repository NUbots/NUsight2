import { observable } from 'mobx'

export class Transform {
  @observable public rotate: number
  @observable public scale: number
  @observable public translate: { x: number, y: number }

  public constructor(opts: Transform) {
    this.rotate = opts.rotate
    this.scale = opts.scale
    this.translate = opts.translate
  }

  public static of(opts: Transform): Transform {
    return new Transform(opts)
  }
}
