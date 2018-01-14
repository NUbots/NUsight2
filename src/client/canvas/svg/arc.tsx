import { observer } from 'mobx-react'
import * as React from 'react'

import { Transform } from '../../math/transform'
import { ArcGeometry } from '../geometry/arc_geometry'
import { Shape } from '../object/shape'

import { toSvgProps } from './svg'


type Props = { model: Shape<ArcGeometry>, world: Transform }
export const Arc = observer(({
                               model: {
                                 geometry: { origin, radius, startAngle, endAngle, anticlockwise },
                                 appearance,
                               }, world,
                             }: Props) => {

  // Is this arc empty?
  if (radius < 0) {
    throw new Error(`Negative radius: ${radius}`)
  }

  // Work out our start and end points on the circle
  const p0 = {
    x: origin.x + radius * Math.cos(startAngle),
    y: origin.y + radius * Math.sin(startAngle),
  }

  const p1 = {
    x: origin.x + radius * Math.cos(endAngle),
    y: origin.y + radius * Math.sin(endAngle),
  }

  // Our cw value must be a 0/1 not true/false
  const cw = +!anticlockwise
  const da = anticlockwise ? startAngle - endAngle : endAngle - startAngle

  // Move to (x0,y0).
  let path = `M${p0.x} ${p0.y}`

  // Draw the arc
  path += `A${radius} ${radius} 0 ${+(da >= Math.PI)} ${cw} ${p1.x} ${p1.y}`


  return (<path d={path}
                {...toSvgProps(appearance)}
  />)
})
