import { createTransformer } from 'mobx-utils'
import { Graphics } from 'pixi.js'
import { Container } from 'pixi.js'
import { DisplayObject } from 'pixi.js'

import { Transform } from '../../math/transform'
import { Appearance } from '../appearance/appearance'
import { BasicAppearance } from '../appearance/basic_appearance'
import { LineAppearance } from '../appearance/line_appearance'
import { ArcGeometry } from '../geometry/arc_geometry'
import { ArrowGeometry } from '../geometry/arrow_geometry'
import { CircleGeometry } from '../geometry/circle_geometry'
import { LineGeometry } from '../geometry/line_geometry'
import { MarkerGeometry } from '../geometry/marker_geometry'
import { PathGeometry } from '../geometry/path_geometry'
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
import { renderPath } from './path'
import { renderPolygon } from './polygon'
import { renderText } from './text'

export const renderObject2d = createTransformer((obj: Object2d): DisplayObject => {

  if (obj instanceof Group) {
    const g = new Container()

    g.scale.x = obj.transform.scale.x
    g.scale.y = obj.transform.scale.x
    g.x = obj.transform.translate.x
    g.y = obj.transform.translate.y
    g.rotation = obj.transform.rotate

    obj.children.forEach(o => {
      g.addChild(renderObject2d(o))
    })

    return g

  } else if (obj instanceof Shape) {
    if (obj.geometry instanceof ArcGeometry) {
      return renderArc(obj)
    } else if (obj.geometry instanceof ArrowGeometry) {
      return renderArrow(obj)
    } else if (obj.geometry instanceof CircleGeometry) {
      return renderCircle(obj)
    } else if (obj.geometry instanceof LineGeometry) {
      return renderLine(obj)
    } else if (obj.geometry instanceof MarkerGeometry) {
      return renderMarker(obj)
    } else if (obj.geometry instanceof PathGeometry) {
      return renderPath(obj)
    } else if (obj.geometry instanceof PolygonGeometry) {
      return renderPolygon(obj)
    } else if (obj.geometry instanceof TextGeometry) {
      return renderText(obj)
    } else {
      throw new Error(`Unsupported geometry type: ${obj.geometry}`)
    }
  } else {
    throw new Error(`Unsupported Object2d type: ${obj}`)
  }
})

const toPixiColor = (style: string): [number, number] => {
  if (style === 'transparent') {
    return [0, 0]
  }
  let result = /^#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])$/.exec(style)
  if (result !== null) {
    return[parseInt(result[1] + result[1] + result[2] + result[2] + result[3] + result[3], 16), 1]
  }
  result = /^#([A-Fa-f0-9]{6})$/.exec(style)
  if (result !== null) {
    return [parseInt(result[1], 16), 1]
  }

  throw new Error('Pixi cannot handle non hex colours')
}

export function applyAppearance(obj: Graphics, appearance: Appearance, exec: (obj: Graphics) => void): void {

  if (appearance instanceof BasicAppearance) {
    const line = toPixiColor(appearance.strokeStyle)
    const fill = toPixiColor(appearance.fillStyle)
    obj.lineStyle(appearance.lineWidth, line[0], line[1])
    obj.beginFill(fill[0], fill[1])
    exec(obj)
    obj.endFill()
  } else if (appearance instanceof LineAppearance) {
    const line = toPixiColor(appearance.strokeStyle)
    obj.lineStyle(appearance.lineWidth, line[0], line[1])
    exec(obj)
    // ctx.lineCap = appearance.lineCap
    // ctx.lineDashOffset = appearance.lineDashOffset
    // ctx.lineJoin = appearance.lineJoin
    // ctx.lineWidth = appearance.lineWidth
    // ctx.strokeStyle = appearance.strokeStyle
  } else {
    throw new Error(`Unsupported appearance type: ${appearance}`)
  }
}
