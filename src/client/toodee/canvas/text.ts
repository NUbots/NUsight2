import { Transform } from '../../math/transform'
import { Vector2 } from '../../math/vector2'
import { TextGeometry } from '../geometry/text_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './canvas'

export function renderText(context: CanvasRenderingContext2D, shape: Shape<TextGeometry>, world: Transform): void {

  const { x, y, text, maxWidth, fontFamily, textAlign, textBaseline, alignToView } = shape.geometry

  context.font = `1em ${fontFamily}`
  context.textAlign = textAlign
  context.textBaseline = textBaseline

  const position = Vector2.of(x, y)

  const textWidth = context.measureText(text).width
  const scale = maxWidth / textWidth

  if (alignToView) {
    // Ensure the text is always rendered without rotation such that it is aligned with the screen.
    context.scale(Math.sign(world.scale.x), Math.sign(world.scale.y))
    context.rotate(-world.rotate)
    position.transform(Transform.of({
      rotate: -world.rotate,
      scale: { x: Math.sign(world.scale.x), y: Math.sign(world.scale.y) },
    }))
  }

  context.scale(scale, scale)
  context.translate(position.x / scale, position.y / scale)

  applyAppearance(context, shape.appearance)

  context.fillText(text, 0, 0)
}
