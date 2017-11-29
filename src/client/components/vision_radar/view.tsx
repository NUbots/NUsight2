import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import * as React from 'react'
import { VisionRadarModel } from './model'
import { VisionRadarRobotModel } from './model'
import { VisionRadarRobotViewModel } from './view_model'

@observer
export class VisionRadarView extends Component<{ model: VisionRadarModel }> {
  public render() {
    const { model } = this.props
    return (
      <div>
        <h1>Vision Radar</h1>
        {model.robots.map(robot => <VisionRadarRobotView key={robot.id} model={robot}/>)}
      </div>
    )
  }
}

@observer
export class VisionRadarRobotView extends Component<{ model: VisionRadarRobotModel }> {
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
      <div>
        <canvas width={1000} height={1000} ref={this.onRef} style={{ display: 'block', border: '1px solid red', margin: '6px' }}/>
      </div>
    )
  }

  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.canvas = canvas
  }

  private renderScene() {
    const { props, canvas } = this
    const { model } = props
    const viewModel = VisionRadarRobotViewModel.of(model)
    const renderer = viewModel.renderer(canvas!)
    renderer.render(viewModel.scene, viewModel.camera)
  }
}
