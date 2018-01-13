import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Group as GroupGeometry } from '../object/group'
import { Shape } from '../object/shape'

import { transform, viewForGeometry } from './svg'

@observer
export class Group extends Component<{model: GroupGeometry}> {

  public render() {
    return <g transform={transform(this.props.model.transform)}>
      {this.props.model.children.map((obj, i) => viewForGeometry(obj, i))}
    </g>
  }
}
