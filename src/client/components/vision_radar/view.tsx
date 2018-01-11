import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { ComponentType } from 'react'
import * as React from 'react'
import { VisionRadarNetwork } from './network'
import * as style from './style.css'
import { VisionRadarViewModel } from './view_model'
import { VisionRadarRobotViewModel } from './view_model'

@observer
export class VisionRadarView extends Component<{
  viewModel: VisionRadarViewModel
  network: VisionRadarNetwork
  Menu: ComponentType
}> {
  public componentWillUnmount() {
    this.props.network.destroy()
  }

  public render() {
    const { viewModel, Menu } = this.props
    return (
      <div>
        <Menu/>
        {viewModel.robots.map(robot => <VisionRadarRobotView key={robot.id} viewModel={robot}/>)}
      </div>
    )
  }
}

@observer
export class VisionRadarRobotView extends Component<{ viewModel: VisionRadarRobotViewModel }> {
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
        <canvas width={1000} height={1000} ref={this.onRef} className={style.canvas}/>
      </div>
    )
  }

  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.canvas = canvas
  }

  private renderScene() {
    const { props, canvas } = this
    const { viewModel } = props
    const renderer = viewModel.renderer(canvas!)
    renderer.render(viewModel.scene, viewModel.camera)
  }
}
