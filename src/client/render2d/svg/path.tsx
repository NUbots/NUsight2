import { observer } from 'mobx-react'
import * as React from 'react'

import { Transform } from '../../math/transform'
import { Vector2 } from '../../math/vector2'
import { PathGeometry } from '../geometry/path_geometry'
import { Shape } from '../object/shape'

import { toSvgProps } from './rendering'

type Props = { model: Shape<PathGeometry>, world: Transform }
export const Path = observer(({ model: { geometry: { path }, appearance } }: Props) => {
  const d = 'M' + path.map((p: Vector2) => `${p.x} ${p.y}`).join('L')

  return (
    <path
      d={d}
      {...toSvgProps(appearance)}
    />
  )
})
