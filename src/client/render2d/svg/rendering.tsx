import { observer } from 'mobx-react'
import * as React from 'react'

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
import { Geometry } from '../object/geometry'
import { Group as GroupGeometry } from '../object/group'
import { Shape } from '../object/shape'

import { Arc } from './arc'
import { Arrow } from './arrow'
import { Circle } from './circle'
import { Group } from './group'
import { Line } from './line'
import { Marker } from './marker'
import { Path } from './path'
import { Polygon } from './polygon'
import { Text } from './text'

export function toSvgProps(appearance: Appearance) {
  if (appearance instanceof BasicAppearance) {
    return {
      ...(appearance.fill ? {
        fill: appearance.fill.color,
        fillOpacity: appearance.fill.alpha,
      } : {
        fill: 'transparent',
      }),
      ...(appearance.stroke ? {
        strokeWidth: appearance.stroke.width,
        stroke: appearance.stroke.color,
        strokeOpacity: appearance.stroke.alpha,
      } : {
        stroke: 'transparent',
      }),
    }
  } else if (appearance instanceof LineAppearance) {
    return {
      strokeLinecap: appearance.stroke.cap,
      strokeLinejoin: appearance.stroke.join,
      strokeDashoffset: appearance.stroke.dashOffset,
      strokeWidth: appearance.stroke.width,
      stroke: appearance.stroke.color,
      strokeOpacity: appearance.stroke.alpha,
      fill: 'transparent',
    }
  } else {
    throw new Error(`Unsupported appearance type ${appearance}`)
  }
}

export function toSvgTransform(transform: Transform): string {
  const s = transform.scale
  const r = (180.0 / Math.PI) * transform.rotate // SVG rotations are in degrees
  const t = transform.translate
  return `translate(${t.x}, ${t.y}) rotate(${r}) scale(${s.x}, ${s.y})`
}

type Props = { obj: GroupGeometry | Shape<Geometry>, world: Transform }

export const GeometryView = observer(({ obj, world }: Props): JSX.Element => {
  if (obj instanceof GroupGeometry) {
    return <Group model={obj} world={world}/>
  } else if (obj instanceof Shape) {
    if (obj.geometry instanceof ArcGeometry) {
      return <Arc model={obj as Shape<ArcGeometry>} world={world}/>
    } else if (obj.geometry instanceof ArrowGeometry) {
      return <Arrow model={obj as Shape<ArrowGeometry>} world={world}/>
    } else if (obj.geometry instanceof CircleGeometry) {
      return <Circle model={obj as Shape<CircleGeometry>} world={world}/>
    } else if (obj.geometry instanceof LineGeometry) {
      return <Line model={obj as Shape<LineGeometry>} world={world}/>
    } else if (obj.geometry instanceof MarkerGeometry) {
      return <Marker model={obj as Shape<MarkerGeometry>} world={world}/>
    } else if (obj.geometry instanceof PathGeometry) {
      return <Path model={obj as Shape<PathGeometry>} world={world}/>
    } else if (obj.geometry instanceof PolygonGeometry) {
      return <Polygon model={obj as Shape<PolygonGeometry>} world={world}/>
    } else if (obj.geometry instanceof TextGeometry) {
      return <Text model={obj as Shape<TextGeometry>} world={world}/>
    } else {
      throw new Error(`Unsupported geometry type: ${obj}`)
    }
  } else {
    throw new Error(`Unsupported geometry type: ${obj}`)
  }
})
