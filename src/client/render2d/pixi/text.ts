import { createTransformer } from 'mobx-utils'
import { Text } from 'pixi.js'
import { TextStyle } from 'pixi.js'

import { Transform } from '../../math/transform'
import { Vector2 } from '../../math/vector2'
import { TextGeometry } from '../geometry/text_geometry'
import { Shape } from '../object/shape'

import { BasicAppearance } from '../appearance/basic_appearance'
import { applyAppearance } from './rendering'

export const renderText = createTransformer((shape: Shape<TextGeometry>): Text => {

  const { x, y, text, maxWidth, fontFamily, textAlign, textBaseline, alignToView } = shape.geometry

  if(shape.appearance instanceof BasicAppearance) {
    const t = new Text(text, {
      fontFamily,
      padding: 10,
      textBaseline: 'middle',
      fill: shape.appearance.fillColor,
      align: textAlign,
    })
    t.x = x
    t.y = y
    t.anchor.x = 0.5
    t.anchor.y = 0.75 // Might be hacks? might not be...

    t.width = maxWidth
    t.scale.y = t.scale.x

    return t
  }
  else {
    throw Error('Pixi text only supports basic appearance')
  }
})
