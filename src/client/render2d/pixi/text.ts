import { createTransformer } from 'mobx-utils'
import { Text } from 'pixi.js'
import { TextStyle } from 'pixi.js'

import { Transform } from '../../math/transform'
import { Vector2 } from '../../math/vector2'
import { TextGeometry } from '../geometry/text_geometry'
import { Shape } from '../object/shape'

import { applyAppearance } from './rendering'

export const renderText = createTransformer((shape: Shape<TextGeometry>): Text => {

  const { x, y, text, maxWidth, fontFamily, textAlign, textBaseline, alignToView } = shape.geometry

  const t = new Text(text, new TextStyle({
    fontFamily,
    textBaseline,
    align: textAlign,
    wordWrapWidth: maxWidth,
  }))
  t.x = x
  t.y = y

  return t
})
