import { observable } from 'mobx'

export class CircleGeometry {
  @observable public radius: number
  @observable public x: number
  @observable public y: number

  constructor(opts: CircleGeometry) {
    this.radius = opts.radius
    this.x = opts.x
    this.y = opts.y
  }
  
  public static of(opts: Partial<CircleGeometry> = {}) {
    return new CircleGeometry({
      radius: opts.radius || 1,
      x: opts.x || 0,
      y: opts.y || 0
    })
  }
}
