import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Transform } from '../../math/transform'
import { TextGeometry } from '../geometry/text_geometry'
import { Shape } from '../object/shape'

import { appearance, transform } from './svg'

@observer
export class Text extends Component<{model: Shape<TextGeometry>, world: Transform}> {

  public render() {
    // TODO handle font size and max width properly

    const m = this.props.model
    const g = m.geometry
    const w = this.props.world
    const t = m.geometry.alignToView ? Transform.of({
      scale: { x: Math.sign(w.scale.x), y: Math.sign(w.scale.y) },
      rotate: -w.rotate,
    }) : Transform.of()

    return <text
      x={g.x}
      y={g.y}
      fontFamily={g.fontFamily}
      fontSize={'0.015rem'}
      textAnchor={g.textAlign}
      dominantBaseline={g.textBaseline}
      transform={transform(t)}
      {...appearance(m.appearance)}>
      {g.text}
    </text>
  }
}
