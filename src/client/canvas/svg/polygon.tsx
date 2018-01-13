import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { PolygonGeometry } from '../geometry/polygon_geometry'
import { Shape } from '../object/shape'

import { appearance } from './svg'

@observer
export class Polygon extends Component<{model: Shape<PolygonGeometry>}> {

  public render() {
    const m = this.props.model
    const g = m.geometry
    return <polygon points={g.points.map(p => `${p.x},${p.y}`).join(' ')} {...appearance(m.appearance)} />
  }
}
