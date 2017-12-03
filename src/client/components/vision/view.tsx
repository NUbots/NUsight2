import { action } from 'mobx'
import { autorun } from 'mobx'
import { observable } from 'mobx'
import { IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
import { VisionModel } from './model'
import { VisionNetwork } from './network'
import * as styles from './styles.css'
import { VisionViewModel } from './view_model'
import { RobotViewModel } from './view_model'

type Props = {
  model: VisionModel
  network: VisionNetwork
  Menu: ComponentType
}

@observer
export class VisionView extends Component<Props> {
  // @observable private canvases: Map<string, HTMLCanvasElement>
  // private stopRendering: IReactionDisposer

  // public constructor(props: Props) {
  //   super(props)
  //
  //   // this.canvases = new Map()
  // }

  // public componentDidMount() {
  //   this.stopRendering = autorun(() => this.renderScene())
  // }
  //
  // public componentWillUnmount() {
  //   this.stopRendering()
  //   this.props.network.destroy()
  // }

  public render() {
    const { model, Menu } = this.props
    const viewModel = VisionViewModel.of(model)

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

  // private renderScene() {
  //   const viewModel = VisionViewModel.of(this.props.model)
  //   viewModel.robots.forEach(viewModel => {
  //     viewModel.layers.forEach((layer, layerIndex) => {
  //       const canvas = this.canvases.get(this.hash(viewModel, layerIndex))
  //       if (canvas) {
  //         if (layer.type === 'canvas2d') {
  //           layer.renderer(canvas).render(layer.scene, layer.camera)
  //         } else if (layer.type === 'webgl') {
  //           layer.renderer(canvas).render(layer.scene, layer.camera)
  //         }
  //       }
  //     })
  //   })
  // }
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

  render() {
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
    cameraViewModel.renderer(this.canvas!).render(cameraViewModel.scene, cameraViewModel.camera)
  }
}
