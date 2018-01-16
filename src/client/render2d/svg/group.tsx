import { observer } from 'mobx-react'
import * as React from 'react'

import { Transform } from '../../math/transform'
import { Group as GroupGeometry } from '../object/group'

import { GeometryView, toSvgTransform } from './util'

type Props = { model: GroupGeometry, world: Transform }
export const Group = observer(({ model: { children, transform }, world }: Props) => {

  // If we have the identity transform forgo the group to save on dom elements
  const elems = children.map((obj, i) => (<GeometryView key={i} obj={obj} world={transform.clone().then(world)}/>))

  if (transform.isIdentity()) {
    return (
      <>
        {elems}
      </>
    )
  } else {
    return (
      <g transform={toSvgTransform(transform)}>
        {elems}
      </g>
    )
  }
})
