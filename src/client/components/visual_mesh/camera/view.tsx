import { autorun } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

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
    return <canvas
      style={{
        width: `60vw`,
        height: `60vw`,
        maxHeight: `60vh`,
        maxWidth: `60vh`,
      }}
      width={1000}
      height={1000}
      ref={this.onRef}
    />
  }

  @action
  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.props.viewModel.canvas = canvas
  }

  private renderScene = () => {
    const { viewModel } = this.props
    const renderer = viewModel.renderer(viewModel.canvas)
    if (renderer) {
      renderer.render(viewModel.getScene(), viewModel.camera)
    }
  }
}
