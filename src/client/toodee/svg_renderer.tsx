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
  @observable private resolution: Transform = Transform.of()

  render() {
    const { className, scene, camera } = this.props

    const cam = this.resolution.clone().then(camera)

    return (
      <div className={`${className} ${style.container}`}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
        <svg className={style.container}>
          <g transform={toSvgTransform(cam)}>
            <Group model={scene} world={cam}/>
          </g>
        </svg>
      </div>
    )
  }


  @action
  private onResize = (width: number, height: number) => {

    // Apply our canvas size + dpi settings
    const pxWidth = width
    const pxHeight = height

    // Translate to the center
    this.resolution.translate.x = pxWidth * 0.5
    this.resolution.translate.y = pxHeight * 0.5

    // If we have an aspect ratio, use it to scale the canvas to unit size
    const { aspectRatio } = this.props
    if (aspectRatio !== undefined) {

      // Given our aspect ratio work out the scale to ensure it remains on screen
      const canvasAspect = width / height

      // Get a width and height to make the image unit height
      const unitWidth = aspectRatio
      const unitHeight = 1

      // Work out which scale we should use
      const scale = canvasAspect < aspectRatio ? unitWidth / width: unitHeight / height

      // Scale to fit
      this.resolution.scale.x = 1.0 / scale
      this.resolution.scale.y = -1.0 / scale // Flip the y scale to make y up like opengl coordinates
    } else {
      this.resolution.scale.x = 1 / devicePixelRatio
      this.resolution.scale.y = -1 / devicePixelRatio
    }
  }

}
