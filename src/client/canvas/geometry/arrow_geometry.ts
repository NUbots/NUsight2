import { observable } from 'mobx'
import { Vector2 } from '../../math/vector2'

export class ArrowGeometry {
  @observable public direction: Vector2
  @observable public headLength: number
  @observable public headWidth: number
  @observable public length: number
  @observable public origin: Vector2

  constructor(opts: ArrowGeometry) {
    this.direction = opts.direction
    this.headLength = opts.headLength
    this.headWidth = opts.headWidth
    this.length = opts.length
    this.origin = opts.origin
  }

  public static of(opts: Partial<ArrowGeometry> = {}) {
    const length = opts.length || 1
    return new ArrowGeometry({
      direction: opts.direction || Vector2.of(1, 0),
      headLength: 0.2 * length,
      headWidth: 0.04 * length,
      length: opts.length || 1,
      origin: opts.origin || Vector2.of()
    })
  }
}
