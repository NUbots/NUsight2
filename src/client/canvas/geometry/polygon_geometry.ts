import { observable } from 'mobx'
import { Vector2 } from '../../math/vector2'

export class PolygonGeometry {
  @observable public points: Vector2[]

  constructor(opts: PolygonGeometry) {
    this.points = opts.points
  }

  public static of(points: Vector2[]): PolygonGeometry {
    if (points.length < 3) {
      throw new Error('Polygon must have 3 or more points.')
    }
    return new PolygonGeometry({ points })
  }
}
