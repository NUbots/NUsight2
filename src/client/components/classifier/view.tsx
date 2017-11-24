import { autorun } from 'mobx'
import { observable } from 'mobx'
import { ObservableMap } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import { ClassifierViewModel } from './view_model'

type Props = {
  model: ClassifierModel
  network: ClassifierNetwork
}

@observer
export class ClassifierView extends Component<Props> {
  @observable
  private canvases: ObservableMap<HTMLCanvasElement> = new ObservableMap()
  private stopRendering: () => void

  public render() {
    const viewModel = ClassifierViewModel.of(this.props.model)
    return (
      <div>
        <h1>Classifier</h1>
        {viewModel.robots.map(robot => (
          <div key={robot.id} style={{ border: '1px solid red', margin: '6px' }}>
            <canvas
              ref={el => this.onCanvasRef(robot.id, el)}
              style={{ display: 'block' }}
              width={512}
              height={512}
            />
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
        const renderer = viewModel.renderer(canvas)
        renderer.render(viewModel.scene, viewModel.camera)
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
