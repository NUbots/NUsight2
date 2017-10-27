import { action } from 'mobx'
import { autorun } from 'mobx'
import { observable } from 'mobx'
import { IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import * as THREE from 'three'
import { VisionModel } from './model'
import * as styles from './styles.css'
import { VisionViewModel } from './view_model'
import { RobotViewModel } from './view_model'
import { VisionNetwork } from './network'
import { CanvasRenderer } from '../../canvas/renderer'
import { Transform } from '../../math/transform'

type Props = {
  model: VisionModel
  network: VisionNetwork
}

@observer
export class VisionView extends Component<Props> {
  @observable private canvases: Map<string, HTMLCanvasElement>
  private stopRendering: IReactionDisposer

  public constructor(props: Props) {
    super(props)

    this.canvases = new Map()
  }

  public componentDidMount() {
    this.stopRendering = autorun(() => this.renderScene())
  }

  public componentWillUnmount() {
    this.stopRendering()
    this.props.network.destroy()
  }

  public render() {
    const viewModel = VisionViewModel.of(this.props.model)

    // TODO: Some kind of intelligent layout resizing to make it look good.
    return (
      <div>
        <h1>Vision</h1>
        <div>
          {viewModel.robots.map(robot => (
            <div className={styles.robot} key={robot.name}>
              <div className={styles.canvases}>
                {robot.layers.map((layer, index) => (
                  <canvas className={styles.canvas} key={index} ref={this.onRef(robot, index)}></canvas>
                ))}
              </div>
              <div>{robot.name}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  private onRef = (robot: RobotViewModel, index: number) => action((canvas: HTMLCanvasElement) => {
    this.canvases.set(this.hash(robot, index), canvas)
  })

  private renderScene() {
    const viewModel = VisionViewModel.of(this.props.model)
    viewModel.robots.forEach(robot => {
      robot.layers.forEach((layer, layerIndex) => {
        const canvas = this.canvases.get(this.hash(robot, layerIndex))
        if (canvas) {
          if (layer.type === '2d') {
            const camera = Transform.of({ anticlockwise: false })
            layer.renderer(canvas).render(layer.scene, camera)
          } else if (layer.type === 'webgl') {
            const renderer = layer.renderer(canvas)
            renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight)
            renderer.render(layer.scene, layer.camera)
          }
        }
      })
    })
  }

  // TODO: Find an alternative approach for mapping a unique identifier for each canvas.
  private hash(robot: RobotViewModel, index: number) {
    return `${robot.name}:${index}}`
  }
}
