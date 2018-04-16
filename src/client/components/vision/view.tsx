import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import { VisionNetwork } from './network'
import * as styles from './styles.css'
import { VisionViewModel } from './view_model'
import { RobotViewModel } from './view_model'

@observer
export class VisionView extends Component<{
  viewModel: VisionViewModel
  network: VisionNetwork
  Menu: ComponentType
}> {
  componentWillUnmount() {
    this.props.network.destroy()
  }

  render() {
    const { viewModel, Menu } = this.props
    // TODO: Some kind of intelligent layout resizing to make it look good.
    return (
      <div className={styles.vision}>
        <Menu/>
        <div>
          {viewModel.robots.map(robot => <RobotVisionView key={robot.id} viewModel={robot}/>)}
        </div>
      </div>
    )
  }
}

@observer
export class RobotVisionView extends Component<{ viewModel: RobotViewModel }> {
  private destroy: () => void

  componentDidMount() {
    this.destroy = autorun(() => this.renderScene())
  }

  componentWillUnmount() {
    this.destroy()
  }

  render() {
    return (
      // TODO: width/height
      <div className={styles.container}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}/>
        <canvas className={styles.canvas} width={1280} height={1024} ref={this.onRef}/>
      </div>
    )
  }

  private onResize = () => {
    console.log('resize')
  }

  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.props.viewModel.cameraViewModel.canvas = canvas
  }

  private renderScene() {
    const { viewModel } = this.props
    const { cameraViewModel: { renderer, scene, camera } } = viewModel
    if (renderer) {
      renderer.render(scene, camera)
    }
  }
}
