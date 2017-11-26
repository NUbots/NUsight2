import { autorun } from 'mobx'
import { observable } from 'mobx'
import { ObservableMap } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import { ClassifierViewModel } from './view_model'
import { ComponentType } from 'react'

type Props = {
  model: ClassifierModel
  network: ClassifierNetwork
  ColorSpaceVisualizer: ComponentType
}

@observer
export class ClassifierView extends Component<Props> {
  @observable
  private canvases: ObservableMap<HTMLCanvasElement> = new ObservableMap()
  private stopRendering: () => void

  public render() {
    const { model, ColorSpaceVisualizer } = this.props
    const viewModel = ClassifierViewModel.of(model)
    return (
      <div>
        <h1>Classifier</h1>
        {viewModel.robots.map(robot => (
          <div key={robot.id} style={{ border: '1px solid red', margin: '6px', display: 'flex' }}>
            <canvas
              ref={el => this.onCanvasRef(robot.id, el)}
              style={{ display: 'block' }}
              width={512}
              height={512}
            />
            <ColorSpaceVisualizer/>
          </div>
        ))}
      </div>
    )
  }

  public componentDidMount() {
    this.stopRendering = autorun(() => this.renderScene())
  }

  public componentWillUnmount() {
    this.stopRendering()
  }

  private renderScene() {
    console.log('render scene')
    const viewModel = ClassifierViewModel.of(this.props.model)
    viewModel.robots.forEach(robot => {
      const canvas = this.canvases.get(robot.id)
      if (canvas) {
        const renderer = robot.renderer(canvas)
        renderer.render(robot.scene, robot.camera)
      }
    })
  }

  @action
  private onCanvasRef = (id: string, canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      this.canvases.set(id, canvas)
    }
  }
}
