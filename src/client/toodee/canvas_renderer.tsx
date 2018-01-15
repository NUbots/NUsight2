import { IReactionDisposer } from 'mobx'
import { observable } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import { Transform } from '../math/transform'

import { renderObject2d } from './canvas/canvas'
import { RendererProps } from './renderer_props'
import * as style from './style.css'
import { autorun } from 'mobx'

@observer
export class CanvasRenderer extends Component<RendererProps> {
  @observable private resolution: Transform = Transform.of()
  private canvas: HTMLCanvasElement
  private stopAutorun: IReactionDisposer

  componentDidMount() {
    if (!this.canvas) {
      return
    }

    // Render when changes happen
    this.stopAutorun = autorun(() => this.renderCanvas())
  }

  componentWillUnmount() {
    if (this.stopAutorun) {
      this.stopAutorun()
    }
  }

  render() {
    return (
      <div className={`${this.props.className} ${style.container}`}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
        <canvas
          className={style.container}
          width={this.resolution.translate.x * 2}
          height={this.resolution.translate.y * 2}
          ref={this.onRef}
        />
      </div>
    )
  }

  private onRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas
  }

  renderCanvas = () => {
    // Render our scene
    const { scene, camera } = this.props

    const cam = this.resolution.inverse().then(camera)

    renderObject2d(this.canvas.getContext('2d')!, scene, cam)
  }

  @action
  private onResize = (width: number, height: number) => {

    // Multiply all our widths by dpi
    width *= devicePixelRatio
    height *= devicePixelRatio

    // Translate to the center
    this.resolution.translate.x = -width * 0.5
    this.resolution.translate.y = -height * 0.5

    // If we have an aspect ratio, use it to scale the canvas to unit size
    if (this.props.aspectRatio !== undefined) {

      const canvasAspect = width / height
      const scale = canvasAspect < this.props.aspectRatio ? 1 / width : 1 / (height * this.props.aspectRatio)

      // Scale to fit
      this.resolution.scale.x = scale
      this.resolution.scale.y = scale
    } else {
      this.resolution.scale.x = 1
      this.resolution.scale.y = 1
    }
  }
}
