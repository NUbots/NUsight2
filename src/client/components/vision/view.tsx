import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
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
  public render() {
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
  private canvas: HTMLCanvasElement | null
  private destroy: () => void

  public componentDidMount() {
    this.destroy = autorun(() => this.renderScene())
  }

  public componentWillUnmount() {
    this.destroy()
  }

  public render() {
    return (
      <canvas className={styles.canvas} width={1280} height={1024} ref={this.onRef}/>
    )
  }

  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.canvas = canvas
  }

  private renderScene() {
    const { viewModel } = this.props
    const { cameraViewModel } = viewModel
    const renderer = cameraViewModel.renderer(this.canvas!)
    renderer.render(cameraViewModel.scene, cameraViewModel.camera)
  }
}
