import { autorun } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { CameraViewModel } from './view_model'

@observer
export class CameraView extends Component<{ viewModel: CameraViewModel }> {
  private destroy: () => void = () => {}

  componentDidMount() {
    this.destroy = autorun(() => this.renderScene(), {
      scheduler: requestAnimationFrame,
    })
  }

  componentWillUnmount() {
    this.destroy()
  }

  render() {

    const { width, height } = this.props.viewModel

    const aspectRatio = width / height
    const percentage = 60

    return (
      <canvas style={{
        display: 'inline',
        width: `${percentage}vw`,
        height: `${percentage / aspectRatio}vw`,
        maxHeight: `${percentage}vh`,
        maxWidth: `${percentage * aspectRatio}vh`,
      }}
        width={width}
        height={height}
        ref={this.onRef}/>
    )
  }

  @action
  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.props.viewModel.canvas = canvas
  }

  private renderScene() {
    const { viewModel } = this.props
    const { canvas, scene, camera } = viewModel
    const renderer = viewModel.renderer(canvas)
    if (renderer) {
      renderer.render(scene, camera)

      // This is needed as we constantly make new scene objects, if we don't do this the renderLists
      // stores a reference to the scene and mesh causing a memory leak
      renderer.renderLists.dispose()
    }
  }
}
