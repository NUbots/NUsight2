import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Transform } from '../math/transform'

import { Group as GroupGeometry } from './object/group'
import { Group } from './svg/group'
import { transform } from './svg/svg'

export type SVGRendererProps = {
  scene: GroupGeometry
  camera: Transform
}

@observer
export class SVGRenderer extends Component<SVGRendererProps> {

  public render() {
    return <svg>
      <g transform={transform(this.props.camera)}>
        <Group model={this.props.scene}/>
      </g>
    </svg>
  }
}

/*

  arc_geometry
  arrow_geometry
  circle_geometry
  geometry
  line_geometry
  marker_geometry
  polygon_geometry
  text_geometry

*/
