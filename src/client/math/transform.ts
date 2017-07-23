import { observable } from 'mobx'

export type Rotate = number
export type Scale = { x: number, y: number }
export type Translate = { x: number, y: number }

export class Transform {
  @observable public rotate: Rotate
  @observable public scale: Scale
  @observable public translate: Translate

  public constructor(opts: Transform) {
    this.rotate = opts.rotate
    this.scale = opts.scale
    this.translate = opts.translate
  }

  public static of({
    rotate = 0,
    scale = { x: 1, y: 1 },
    translate = { x: 0, y: 0 },
  }: Partial<Transform> = {}): Transform {
    return new Transform({
      rotate,
      scale,
      translate,
    })
  }
}
