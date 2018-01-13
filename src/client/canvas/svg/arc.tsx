import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { ArcGeometry } from '../geometry/arc_geometry'
import { Shape } from '../object/shape'

import { appearance } from './svg'

@observer
export class Arc extends Component<{model: Shape<ArcGeometry>}> {
  // TODO draw arcs
  public render() {
    const m = this.props.model
    const g = m.geometry
    // g.anticlockwise
    // g.startAngle
    // g.endAngle
    // g.origin
    // g.radius
    // rx ry x-axis-rotation large-arc-flag sweep-flag x y
    return <path d={`A ${g.radius} ${g.radius}, 0, 1, 1, 275 275`} {...appearance(m.appearance)} />
  }
}
