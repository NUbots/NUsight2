import { ArrowGeometry } from '../geometry/arrow_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './canvas'

export function renderArrow(context: CanvasRenderingContext2D, shape: Shape<ArrowGeometry>): void {

  const { length, width, headLength, headWidth, origin, direction } = shape.geometry

  const w = width * 0.5
  const hl = headLength * 0.5
  const hw = headWidth * 0.5

  context.translate(origin.x, origin.y)
  context.rotate(Math.atan2(direction.y, direction.x))

  // Draw the arrow facing the positive x-axis.
  context.beginPath()
  context.moveTo(0, -w)
  context.lineTo(length - hl, -w)
  context.lineTo(length - hl, -hw)
  context.lineTo(length, 0)
  context.lineTo(length - hl, hw)
  context.lineTo(length - hl, w)
  context.lineTo(0, w)
  context.closePath()

  applyAppearance(context, shape.appearance)

  context.stroke()
  context.fill()
}
