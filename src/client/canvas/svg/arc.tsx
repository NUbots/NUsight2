import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { ArcGeometry } from '../geometry/arc_geometry'
import { Shape } from '../object/shape'

@observer
export class Arc extends Component<{model: Shape<ArcGeometry>}> {
  // TODO draw arcs
  public render() {
    const g = this.props.model.geometry
    return <path d='' />
  }
}
