import { PolygonGeometry } from '../geometry/polygon_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './canvas'

export function renderPolygon(context: CanvasRenderingContext2D, shape: Shape<PolygonGeometry>): void {
  const { points } = shape.geometry

  context.beginPath()
  context.moveTo(points[0].x, points[0].y)

  for (const point of points.slice(0)) {
    context.lineTo(point.x, point.y)
  }

  context.closePath()

  applyAppearance(context, shape.appearance)

  context.fill()
  context.stroke()
}
