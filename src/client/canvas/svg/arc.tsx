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
    return <path d={this.arc(g.origin,
                             g.radius,
                             g.startAngle,
                             g.endAngle,
                             g.anticlockwise)} {...appearance(m.appearance)} />
  }


  private arc(origin: {x: number, y: number},
              r: number,
              a0: number,
              a1: number,
              ccw: boolean): string {

    // Is this arc empty?
    if (r === 0) {
      return ''
    }
    if (r < 0) {
      throw new Error(`Negative radius: ${r}`)
    }

    // Work out our start and end points on the circle
    const p0 = {
      x: origin.x + r * Math.cos(a0),
      y: origin.y + r * Math.sin(a0),
    }

    const p1 = {
      x: origin.x + r * Math.cos(a1),
      y: origin.y + r * Math.sin(a1),
    }

    // Our cw value must be a 0/1 not true/false
    const cw = +!ccw
    const da = ccw ? a0 - a1 : a1 - a0

    // Move to (x0,y0).
    let output = `M${p0.x} ${p0.y}`

    // Draw the arc
    output += `A${r} ${r} 0 ${+(da >= Math.PI)} ${cw} ${p1.x} ${p1.y}`

    return output
  }
}
