import { ArcGeometry } from '../geometry/arc_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './canvas'

export function renderArc(context: CanvasRenderingContext2D, shape: Shape<ArcGeometry>): void {

  const { origin, radius, startAngle, endAngle, anticlockwise } = shape.geometry

  context.beginPath()
  context.arc(origin.x, origin.y, radius, startAngle, endAngle, anticlockwise)

  applyAppearance(context, shape.appearance)

  context.stroke()
  context.fill()
}
