import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Transform } from '../math/transform'

import { Group as GroupGeometry } from './object/group'
import { Group } from './svg/group'
import { toSvgTransform } from './svg/svg'

export type SVGRendererProps = {
  className: string
  scene: GroupGeometry
  camera: Transform
}

@observer
export class SVGRenderer extends Component<SVGRendererProps> {

  public render() {
    return <svg className={this.props.className}>
      <g transform={toSvgTransform(this.props.camera.inverse())}>
        <Group model={this.props.scene} world={this.props.camera.inverse()}/>
      </g>
    </svg>
  }
}
