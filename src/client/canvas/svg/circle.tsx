import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { CircleGeometry } from '../geometry/circle_geometry'
import { Shape } from '../object/shape'

@observer
export class Circle extends Component<{model: Shape<CircleGeometry>}> {

  public render() {
    const g = this.props.model.geometry
    return <circle cx={g.x} cy={g.y} radius={g.radius} />
  }
}
