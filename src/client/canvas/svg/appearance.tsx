import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Appearance } from '../appearance/appearance'
import { BasicAppearance } from '../appearance/basic_appearance'
import { LineAppearance } from '../appearance/line_appearance'
import { ArcGeometry } from '../geometry/arc_geometry'

@observer
export class Arc extends Component<{appearance: Appearance}> {

  public render() {
    // TODO handle appearance properties
    const a = this.props.appearance
    if (a instanceof BasicAppearance) {
      return <g>
        {this.props.children}
      </g>
    } else if (a instanceof LineAppearance) {
      return <g>
        {this.props.children}
      </g>
    } else {
      throw new Error(`Unsupported appearance type ${a}`)
    }
  }
}
