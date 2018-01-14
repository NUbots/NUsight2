import { Component } from 'react'
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
import { PolygonGeometry } from '../geometry/polygon_geometry'
import { TextGeometry } from '../geometry/text_geometry'
import { Group as GroupGeometry } from '../object/group'
import { Object2d } from '../object/object2d'
import { Geometry } from '../object/shape'
import { Shape } from '../object/shape'

import { Arc } from './arc'
import { Arrow } from './arrow'
import { Circle } from './circle'
import { Group } from './group'
import { Line } from './line'
import { Marker } from './marker'
import { Polygon } from './polygon'
import { Text } from './text'

export function appearance(appearance: Appearance): {} {
  if (appearance instanceof BasicAppearance) {
    return {
      fill: appearance.fillStyle,
      strokeWidth: appearance.lineWidth,
      stroke: appearance.strokeStyle,
    }
  } else if (appearance instanceof LineAppearance) {
    return {
      strokeLinecap: appearance.lineCap,
      strokeLinejoin: appearance.lineJoin,
      strokeDashoffset: appearance.lineDashOffset,
      strokeWidth: appearance.lineWidth,
      stroke: appearance.strokeStyle,
    }
  } else {
    throw new Error(`Unsupported appearance type ${appearance}`)
  }
}

export function transform(transform: Transform): string {
  const s = transform.scale
  const r = transform.rotate
  const t = transform.translate
  return `scale(${s.x}, ${s.y}) rotate(${r}) translate(${t.x}, ${t.y})`
}

export function viewForGeometry(obj: Object2d, index: number): JSX.Element {

  // TODO wrap things in appearance tags
  if (obj instanceof GroupGeometry) {
    return <Group key={index} model={obj}/>
  } else if (obj instanceof Shape) {
    if (obj.geometry instanceof ArcGeometry) {
      return <Arc key={index} model={obj}/>
    } else if (obj.geometry instanceof ArrowGeometry) {
      return <Arrow key={index} model={obj}/>
    } else if (obj.geometry instanceof CircleGeometry) {
      return <Circle key={index} model={obj}/>
    } else if (obj.geometry instanceof LineGeometry) {
      return <Line key={index} model={obj}/>
    } else if (obj.geometry instanceof MarkerGeometry) {
      return <Marker key={index} model={obj}/>
    } else if (obj.geometry instanceof PolygonGeometry) {
      return <Polygon key={index} model={obj}/>
    } else if (obj.geometry instanceof TextGeometry) {
      return <Text key={index} model={obj}/>
    } else {
      throw new Error(`Unsupported geometry type: ${obj}`)
    }
  } else {
    throw new Error(`Unsupported geometry type: ${obj}`)
  }
}
