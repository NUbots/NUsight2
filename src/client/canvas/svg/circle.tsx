import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { CircleGeometry } from '../geometry/circle_geometry'
import { Shape } from '../object/shape'

import { appearance } from './svg'

@observer
export class Circle extends Component<{model: Shape<CircleGeometry>}> {

  public render() {
    const m = this.props.model
    const g = m.geometry
    return <circle cx={g.x} cy={g.y} r={g.radius} {...appearance(m.appearance)} />
  }
}
