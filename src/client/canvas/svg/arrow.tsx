import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { ArrowGeometry } from '../geometry/arrow_geometry'
import { Shape } from '../object/shape'

import { appearance } from './svg'

@observer
export class Arrow extends Component<{model: Shape<ArrowGeometry>}> {
  // TODO draw arrows using lines
  public render() {
    const m = this.props.model
    const g = m.geometry
    const w = g.width * 0.5
    const hl = g.headLength * 0.5
    const hw = g.headWidth * 0.5
    const r = (180 / Math.PI) * Math.atan2(g.direction.y, g.direction.x)

    let path = `M0 ${-w}`
    path += `L${g.length - hl} ${-w}`
    path += `L${g.length - hl} ${-hw}`
    path += `L${g.length} 0`
    path += `L${g.length - hl} ${hw}`
    path += `L${g.length - hl} ${w}`
    path += `L0 ${w}`

    return <path
      d={path}
      transform={`translate(${g.origin.x},${g.origin.y}) rotate(${r})`}
      {...appearance(m.appearance)}/>
  }
}
