import { IReactionDisposer } from 'mobx'
import { observable } from 'mobx'
import { action } from 'mobx'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import { Transform } from '../math/transform'

import { renderObject2d } from './canvas/canvas'
import { RendererProps } from './renderer_props'
import * as style from './style.css'

@observer
export class CanvasRenderer extends Component<RendererProps> {
  @observable private resolution: Transform = Transform.of()
  @observable private gate: boolean = false // This variable is always false, it just gives mobx an excuse to try
  @observable private shouldRender: boolean = false
  @observable private canRender: boolean = true
  private canvas: HTMLCanvasElement
  private stopAutoruns: IReactionDisposer[]

  componentDidMount() {
    if (!this.canvas) {
      return
    }

    // This autorunner just watches the render function to see when it would like to run
    this.stopAutoruns.push(autorun(action(() => {

      // This gate is always false, but the fact that it is an observable lets mobx traverse down here for dependencies
      // This way it will update whenever something that the renderObject2d method needs changes and set shouldRender
      if (this.gate) {
        const { scene, camera } = this.props
        renderObject2d(this.canvas.getContext('2d')!, scene, this.resolution.clone().then(camera.inverse()))
      }

      // Set that we should render
      this.shouldRender = true
    })))

    // Render when changes happen
    this.stopAutoruns.push(autorun(() => this.renderCanvas()))
  }

  componentWillUnmount() {
    this.stopAutoruns.forEach(fn => {
      fn()
    })
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

  @action
  renderCanvas = () => {

    // If we can render and want to render
    if (this.shouldRender && this.canRender) {

      // Render our scene
      const { scene, camera } = this.props
      renderObject2d(this.canvas.getContext('2d')!, scene, camera.clone().then(this.resolution))

      // We have rendered, now wait for the next time we can
      this.canRender = false
      this.shouldRender = false
      requestAnimationFrame(action(() => this.canRender = true))
    }
  }

  @action
  private onResize(width: number, height: number) {

    // Apply our canvas size + dpi settings
    const pxWidth = width * devicePixelRatio
    const pxHeight = height * devicePixelRatio

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
      const scale = canvasAspect > aspectRatio ? unitWidth / width : unitHeight / height

      // Scale to fit
      this.resolution.scale.x = scale
      this.resolution.scale.y = -scale // Flip the y scale to make y up like opengl coordinates
    } else {
      this.resolution.scale.x = 1 / devicePixelRatio
      this.resolution.scale.y = -1 / devicePixelRatio
    }
  }
}
