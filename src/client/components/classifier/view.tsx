import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import * as styles from './styles.css'
import { ClassifierRobotViewModel } from './view_model'
import { ClassifierViewModel } from './view_model'

@observer
export class ClassifierView extends Component<{
  model: ClassifierModel
  network: ClassifierNetwork
  Menu: ComponentType,
  ColorSpaceVisualizer: ComponentType
}> {
  public render() {
    const { model, Menu } = this.props
    const viewModel = ClassifierViewModel.of(model)
    return (
      <div className={styles.classifier}>
        <Menu/>
        {viewModel.robots.map(robot => <ClassifierRobotView key={robot.id} viewModel={robot}/>)}
      </div>
    )
  }
}

@observer
class ClassifierRobotView extends Component<{ viewModel: ClassifierRobotViewModel }> {
  private canvas: HTMLCanvasElement | null
  private stopRendering: () => void

  public render() {
    return (
      <div className={styles.lutDisplay}>
        <canvas className={styles.lutCanvas} ref={this.onCanvasRef} width={512} height={512}/>
      </div>
    )
  }

  public componentDidMount() {
    this.stopRendering = autorun(() => this.renderScene())
  }

  public componentWillUnmount() {
    this.stopRendering()
  }

  private onCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas
  }

  private renderScene() {
    const { viewModel } = this.props
    const renderer = viewModel.renderer(this.canvas!)
    renderer.render(viewModel.scene, viewModel.camera)
  }
}
