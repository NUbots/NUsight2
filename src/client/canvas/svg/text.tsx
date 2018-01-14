import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { TextGeometry } from '../geometry/text_geometry'
import { Shape } from '../object/shape'

import { appearance, transform } from './svg'

@observer
export class Text extends Component<{model: Shape<TextGeometry>}> {

  public render() {

    // TODO handle thsese properties
    // @observable public alignToView: boolean
    // @observable public maxWidth: number
    // @observable public textAlign: 'start' | 'end' | 'left' | 'right' | 'center'
    // @observable public textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'

    const m = this.props.model
    const g = m.geometry
    return <text
      x={g.x}
      y={g.y}
      fontFamily={g.fontFamily}
      fontSize={'0.02rem'}
      textAnchor={g.textAlign}
      dominantBaseline={g.textBaseline}
      {...appearance(m.appearance)}>
      {g.text}
    </text>
  }
}
