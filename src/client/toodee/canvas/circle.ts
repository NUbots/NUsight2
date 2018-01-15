import { CircleGeometry } from '../geometry/circle_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './canvas'

export function renderCircle(context: CanvasRenderingContext2D, shape: Shape<CircleGeometry>): void {

  const { x, y, radius } = shape.geometry

  context.beginPath()
  context.arc(
    x,
    y,
    radius,
    0,
    2 * Math.PI,
  )

  applyAppearance(context, shape.appearance)

  context.fill()
  context.stroke()
}
