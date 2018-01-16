import { observable } from 'mobx'

import { Appearance } from '../appearance/appearance'
import { BasicAppearance } from '../appearance/basic_appearance'
import { ArcGeometry } from '../geometry/arc_geometry'
import { ArrowGeometry } from '../geometry/arrow_geometry'
import { CircleGeometry } from '../geometry/circle_geometry'
import { LineGeometry } from '../geometry/line_geometry'
import { PolygonGeometry } from '../geometry/polygon_geometry'
import { TextGeometry } from '../geometry/text_geometry'

export type Geometry =
  ArcGeometry
  | ArrowGeometry
  | CircleGeometry
  | LineGeometry
  | PolygonGeometry
  | TextGeometry

export type ShapeOpts<T extends Geometry> = {
  appearance: Appearance
  geometry: T
}

export class Shape<T extends Geometry> {
  @observable appearance: Appearance
  @observable geometry: T

  constructor(opts: ShapeOpts<T>) {
    this.appearance = opts.appearance
    this.geometry = opts.geometry
  }

  static of<T extends Geometry>(geometry: T, appearance: Appearance = BasicAppearance.of()) {
    return new Shape<T>({
      appearance,
      geometry,
    })
  }
}
