import { autorun } from 'mobx'
import { action } from 'mobx'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import * as styles from './styles.css'
import { CameraViewModel } from './view_model'

@observer
export class CameraView extends Component<{ viewModel: CameraViewModel }> {

  private destroy: () => void = () => {
  }

  componentDidMount() {
    this.destroy = autorun(this.renderScene, { scheduler: requestAnimationFrame })
  }

  componentWillUnmount() {
    this.destroy()
  }

  render() {
    const { imageWidth, imageHeight, viewWidth, viewHeight } = this.props.viewModel

    if (!imageWidth || !imageHeight) {
      return null
    }

    // TODO THE CANVAS WIDTH/HEIGHT NEEDS TO BE CALCULATED AUTOMATICALLY USING DPI ETC NONSENSE
    const aspectRatio = imageWidth / imageHeight
    const percentage = 60
    return (
      <div
        style={{
          width: `${percentage}vw`,
          height: `${percentage / aspectRatio}vw`,
          maxHeight: `${percentage}vh`,
          maxWidth: `${percentage * aspectRatio}vh`,
        }}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
        <canvas
          className={styles.display}
          width={viewWidth || imageWidth}
          height={viewHeight || imageHeight}
          ref={this.onRef}
        />
      </div>
    )
  }

  @action
  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.props.viewModel.canvas = canvas
  }

  @action
  private onResize = (width: number, height: number) => {

    const { renderer, canvas } = this.props.viewModel

    width *= devicePixelRatio
    height *= devicePixelRatio

    this.props.viewModel.viewWidth = width * devicePixelRatio
    this.props.viewModel.viewHeight = height * devicePixelRatio
    renderer(canvas)!.setSize(width, height)
  }

  private renderScene = () => {
    const { viewModel } = this.props
    const renderer = viewModel.renderer(viewModel.canvas)
    if (renderer) {
      renderer.render(viewModel.getScene(), viewModel.getCamera())
    }
  }
}
