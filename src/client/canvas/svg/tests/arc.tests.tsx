import * as React from 'react'
import { BasicAppearance } from '../../appearance/basic_appearance'
import { ArcGeometry } from '../../geometry/arc_geometry'
import { Shape } from '../../object/shape'
import { Arc } from '../arc'
import { Transform } from '../../../math/transform'

describe('ArcSVGRenderer', () => {
  it('renders', () => {
    const model = Shape.of(ArcGeometry.of(), BasicAppearance.of())
    const world = Transform.of()
    expect(<Arc model={model} world={world}/>).toMatchSnapshot()
  })
})
