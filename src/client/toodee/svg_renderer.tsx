import { observable } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import { Transform } from '../math/transform'

import { RendererProps } from './renderer_props'
import * as style from './style.css'
import { Group } from './svg/group'
import { toSvgTransform } from './svg/svg'

@observer
export class SVGRenderer extends Component<RendererProps> {
  @observable private resolution: Transform

  render() {
    const { className, scene, camera } = this.props

    return (
      <div className={`${this.props.className} ${style.container}`}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
        <svg className={style.container}>
          <g transform={toSvgTransform(camera.inverse())}>
            <Group model={scene} world={camera.inverse()}/>
          </g>
        </svg>
      </div>
    )
  }

  @action
  private onResize(width: number, height: number) {

    // We have an aspect ratio to preserve
    if (this.props.aspectRatio !== undefined) {

    } else {
      this.resolution.scale.x = 1
      this.resolution.scale.y = 1
      this.resolution.translate.x = width * 0.5
      this.resolution.translate.y = height * 0.5
    }
    // Apply our canvas size + dpi settings
    const pxWidth = width
    const pxHeight = height

    // Work out our aspect ratio and scale by it
    // Translate to the center
    const scale = Math.min(width / height, height / width)
    this.resolution.scale.x = scale
    this.resolution.scale.y = scale
    this.resolution.translate.x = pxWidth * 0.5
    this.resolution.translate.y = pxHeight * 0.5
  }

}
