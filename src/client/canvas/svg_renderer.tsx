import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Transform } from '../math/transform'

import { Group as GroupGeometry } from './object/group'
import { Group } from './svg/group'
import { transform } from './svg/svg'

export type SVGRendererProps = {
  className: string
  scene: GroupGeometry
  camera: Transform
}

@observer
export class SVGRenderer extends Component<SVGRendererProps> {

  public render() {

    const c = this.props.camera.clone()

    c.scale.x = 1 / c.scale.x
    c.scale.y = 1 / c.scale.y
    c.translate.x = -c.translate.x / c.scale.x
    c.translate.y = -c.translate.y / c.scale.y

    return <svg className={this.props.className}>
      <g transform={transform(c)}>
        <Group model={this.props.scene}/>
      </g>
    </svg>
  }
}
