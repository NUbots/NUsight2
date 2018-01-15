import { LineGeometry } from '../geometry/line_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './canvas'

export function renderLine(context: CanvasRenderingContext2D, shape: Shape<LineGeometry>): void {

  const { origin, target } = shape.geometry

  context.beginPath()
  context.moveTo(origin.x, origin.y)
  context.lineTo(target.x, target.y)

  applyAppearance(context, shape.appearance)

  context.stroke()
}
