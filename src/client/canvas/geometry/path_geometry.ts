import { observable } from 'mobx'
import { Vector2 } from '../../math/vector2'

export type Path = Vector2

export class PathGeometry {
  @observable public path: Path[] | ReadonlyArray<Path>

  constructor(opts: PathGeometry) {
    this.path = opts.path
  }

  public static of(path: Path[] | ReadonlyArray<Path>): PathGeometry {
    return new PathGeometry({ path })
  }
}
