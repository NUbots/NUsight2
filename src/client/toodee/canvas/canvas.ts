import { Transform } from '../../math/transform'
import { Vector2 } from '../../math/vector2'
import { Appearance } from '../appearance/appearance'
import { BasicAppearance } from '../appearance/basic_appearance'
import { LineAppearance } from '../appearance/line_appearance'
import { ArcGeometry } from '../geometry/arc_geometry'
import { ArrowGeometry } from '../geometry/arrow_geometry'
import { CircleGeometry } from '../geometry/circle_geometry'
import { LineGeometry } from '../geometry/line_geometry'
import { MarkerGeometry } from '../geometry/marker_geometry'
import { PolygonGeometry } from '../geometry/polygon_geometry'
import { TextGeometry } from '../geometry/text_geometry'
import { Group } from '../object/group'
import { Object2d } from '../object/object2d'
import { Shape } from '../object/shape'

import { renderArc } from './arc'
import { renderArrow } from './arrow'
import { renderCircle } from './circle'
import { renderLine } from './line'
import { renderMarker } from './marker'
import { renderPolygon } from './polygon'
import { renderText } from './text'

export function renderObject2d(context: CanvasRenderingContext2D, obj: Object2d, world: Transform) {

  if (obj instanceof Group) {
    const newWorld = world.clone().then(obj.transform)

    for (const o of obj.children) {
      context.save()
      applyTransform(context, obj.transform)
      renderObject2d(context, o, newWorld)
      context.restore()
    }
  } else if (obj instanceof Shape) {
    if (obj.geometry instanceof ArcGeometry) {
      renderArc(context, obj)
    } else if (obj.geometry instanceof ArrowGeometry) {
      renderArrow(context, obj)
    } else if (obj.geometry instanceof CircleGeometry) {
      renderCircle(context, obj)
    } else if (obj.geometry instanceof LineGeometry) {
      renderLine(context, obj)
    } else if (obj.geometry instanceof MarkerGeometry) {
      renderMarker(context, obj)
    } else if (obj.geometry instanceof PolygonGeometry) {
      renderPolygon(context, obj)
    } else if (obj.geometry instanceof TextGeometry) {
      renderText(context, obj, world)
    } else {
      throw new Error(`Unsupported geometry type: ${obj.geometry}`)
    }
  } else {
    throw new Error(`Unsupported Object2d type: ${obj}`)
  }
}

export function applyTransform(context: CanvasRenderingContext2D, transform: Transform): void {

  const translationDash = Vector2.from(transform.translate).transform(Transform.of({
    rotate: transform.rotate * (transform.anticlockwise ? 1 : -1),
    scale: { x: 1 / transform.scale.x, y: 1 / transform.scale.y },
  }))

  context.scale(transform.scale.x, transform.scale.y)
  context.rotate(transform.rotate * (transform.anticlockwise ? 1 : -1))
  context.translate(translationDash.x, translationDash.y)
}

export function applyAppearance(context: CanvasRenderingContext2D, appearance: Appearance): void {

  if (appearance instanceof BasicAppearance) {
    context.fillStyle = appearance.fillStyle
    context.lineWidth = appearance.lineWidth
    context.strokeStyle = appearance.strokeStyle
  } else if (appearance instanceof LineAppearance) {
    context.lineCap = appearance.lineCap
    context.lineDashOffset = appearance.lineDashOffset
    context.lineJoin = appearance.lineJoin
    context.lineWidth = appearance.lineWidth
    context.strokeStyle = appearance.strokeStyle
  } else {
    throw new Error(`Unsupported appearance type: ${appearance}`)
  }
}
