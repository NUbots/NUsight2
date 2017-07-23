import { observable } from 'mobx'
import { Vector2 } from '../../math/vector2'

export class MarkerGeometry {
  @observable public heading: Vector2
  @observable public radius: number
  @observable public x: number
  @observable public y: number

  constructor(opts: MarkerGeometry) {
    this.heading = opts.heading
    this.radius = opts.radius
    this.x = opts.x
    this.y = opts.y
  }

  public static of(opts: Partial<MarkerGeometry> = {}) {
    return new MarkerGeometry({
      heading: opts.heading || Vector2.of(1, 1),
      radius: opts.radius || 1,
      x: opts.x || 0,
      y: opts.y || 0,
    })
  }
}