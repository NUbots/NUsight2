import { observable } from 'mobx'
import { Vector2 } from '../../math/vector2'

export class PolygonGeometry {
  @observable public points: Vector2[]

  constructor(opts: PolygonGeometry) {
    const points = opts.points
    if (points.length < 3) {
      throw new Error(`Polygon must have 3 or more points, ${points.length} points given.`)
    }
    this.points = points
  }

  public static create(points: Vector2[]): PolygonGeometry {
    return new PolygonGeometry({ points })
  }
}
