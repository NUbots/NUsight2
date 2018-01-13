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
    const g = this.props.model.geometry
    return <g/>
  }
}
