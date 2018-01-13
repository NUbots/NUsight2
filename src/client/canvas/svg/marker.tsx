import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { MarkerGeometry } from '../geometry/marker_geometry'
import { Shape } from '../object/shape'

@observer
export class Marker extends Component<{model: Shape<MarkerGeometry>}> {

  // TODO draw markers
  public render() {
    return <g/>
  }
}
