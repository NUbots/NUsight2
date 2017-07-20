import { observable } from 'mobx'

export class RectangleGeometry {
  @observable public height: number
  @observable public width: number
  @observable public x: number
  @observable public y: number

  constructor(opts: RectangleGeometry) {
    this.height = opts.height
    this.width = opts.width
    this.x = opts.x
    this.y = opts.y
  }

  public static of(opts: Partial<RectangleGeometry> = {}) {
    return new RectangleGeometry({
      height: opts.height || 1,
      width: opts.width || 1,
      x: opts.x || 0,
      y: opts.y || 0
    })
  }
}
