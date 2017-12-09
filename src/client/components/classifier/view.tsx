import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import * as styles from './styles.css'
import { ClassifierViewModel } from './view_model'
import { ClassifierRobotViewModel } from './view_model'

@observer
export class ClassifierView extends Component<{
  viewModel: ClassifierViewModel
  Menu: ComponentType,
  ColorSpaceVisualizer: ComponentType
  componentWillUnmount(): void,
}> {
  public render() {
    const { viewModel, Menu, ColorSpaceVisualizer } = this.props
    return (
      <div className={styles.classifier}>
        <Menu/>
        {viewModel.robots.map(robot => (
          <ClassifierRobotView
            key={robot.id}
            viewModel={robot}
            ColorSpaceVisualizer={ColorSpaceVisualizer}
          />
        ))}
      </div>
    )
  }

  public componentWillUnmount() {
    this.props.componentWillUnmount()
  }
}

@observer
class ClassifierRobotView extends Component<{
  viewModel: ClassifierRobotViewModel,
  ColorSpaceVisualizer: ComponentType,
}> {
  private canvas: HTMLCanvasElement | null
  private stopRendering: () => void

  public render() {
    const { ColorSpaceVisualizer } = this.props
    return (
      <div className={styles.lutDisplay}>
        <canvas className={styles.lutCanvas} ref={this.onCanvasRef} width={512} height={512}/>
        <ColorSpaceVisualizer/>
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
