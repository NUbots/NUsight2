import { observer } from 'mobx-react'
import * as React from 'react'

import { Transform } from '../../math/transform'
import { LineGeometry } from '../geometry/line_geometry'
import { Shape } from '../object/shape'

import { toSvgProps } from './svg'

type Props = { model: Shape<LineGeometry>, world: Transform }
export const Line = observer(({ model: { geometry, appearance }, world }: Props) => (
  <line
    x1={geometry.origin.x}
    y1={geometry.origin.y}
    x2={geometry.target.x}
    y2={geometry.target.y}
    {...toSvgProps(appearance)}
  />
))
