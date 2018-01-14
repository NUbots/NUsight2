import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { MarkerGeometry } from '../geometry/marker_geometry'
import { Shape } from '../object/shape'

import { appearance } from './svg'

@observer
export class Marker extends Component<{model: Shape<MarkerGeometry>}> {

  // TODO draw markers
  public render() {
    const m = this.props.model
    const g = m.geometry
    const s = g.radius
    // Need to add 135, as by default the marker points to the top left
    const r = 135.0 + (180.0 / Math.PI) * Math.atan2(g.heading.y, g.heading.x)

    return <path d='M-1 -1L0 -1A1 1 270 1 1 -1 0Z'
                 transform={`scale(${s}, ${s}) rotate(${r}) translate(${g.x}, ${g.y})`}
                 {...appearance(m.appearance)} />
  }
}
