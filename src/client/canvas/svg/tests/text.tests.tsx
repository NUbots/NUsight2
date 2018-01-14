import * as React from 'react'

import { Transform } from '../../../math/transform'
import { BasicAppearance } from '../../appearance/basic_appearance'
import { TextGeometry } from '../../geometry/text_geometry'
import { Shape } from '../../object/shape'
import { Text } from '../text'

describe('TextSVGRenderer', () => {
  it('renders', () => {
    const model = Shape.of(TextGeometry.of(), BasicAppearance.of())
    const world = Transform.of()
    expect(<Text model={model} world={world}/>).toMatchSnapshot()
  })
})
