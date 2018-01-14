import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Transform } from '../../math/transform'
import { Group as GroupGeometry } from '../object/group'
import { Shape } from '../object/shape'

import { transform, viewForGeometry } from './svg'

@observer
export class Group extends Component<{model: GroupGeometry, world: Transform}> {

  public render() {
    return <g transform={transform(this.props.model.transform)}>
      {this.props.model.children.map((obj, i) =>
        viewForGeometry(obj, i, this.props.world.clone().then(this.props.model.transform.inverse())))}
    </g>
  }
}
