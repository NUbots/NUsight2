import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { LineGeometry } from '../geometry/line_geometry'
import { Shape } from '../object/shape'

@observer
export class Line extends Component<{model: Shape<LineGeometry>}> {

  public render() {
    const g = this.props.model.geometry
    const p1 = g.origin
    const p2 = g.target
    return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/>
  }
}
