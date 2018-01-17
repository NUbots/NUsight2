import { observable } from 'mobx'

import { Vector2 } from '../../math/vector2'

export type Path = Vector2

export class PathGeometry {
  @observable path: Path[]

  constructor(opts: PathGeometry) {
    this.path = opts.path
  }

  static of(path: Path[]): PathGeometry {
    return new PathGeometry({ path })
  }
}
