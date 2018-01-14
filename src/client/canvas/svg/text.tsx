import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Transform } from '../../math/transform'
import { TextGeometry } from '../geometry/text_geometry'
import { Shape } from '../object/shape'

import { svgAppearanceAttributes, toSvgTransform } from './svg'


type Props = { model: Shape<TextGeometry>, world: Transform }
export const Text = observer(({ model: {
  geometry: {
    x, y, fontFamily, text, maxWidth, textAlign, textBaseline, alignToView,
  }, appearance,
},                              world }: Props) => {

  // TODO handle font size and max width properly
  const t = alignToView ? Transform.of({
    scale: { x: Math.sign(world.scale.x), y: Math.sign(world.scale.y) },
    rotate: -world.rotate,
  }) : Transform.of()

  return <text
    x={x}
    y={y}
    fontFamily={fontFamily}
    fontSize={'0.015rem'}
    textAnchor={textAlign}
    dominantBaseline={textBaseline}
    transform={toSvgTransform(t)}
    {...svgAppearanceAttributes(appearance)}>
    {text}
  </text>
})

