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

type Props = {
  model: VisionModel
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
            // TODO: Use the canvas engine used by dashboard.
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.beginPath()
              ctx.arc(canvas.clientWidth / 2, canvas.clientHeight / 2, 10, 0, 2 * Math.PI)
              ctx.fillStyle = 'orange'
              ctx.fill()
            }
          } else if (layer.type === 'webgl') {
            // TODO: Do this properly, somehow.
            const renderer = new THREE.WebGLRenderer({ canvas })
            const scene = new THREE.Scene()
            const geometry = new THREE.BoxGeometry(1, 1, 1)
            const material = new THREE.MeshBasicMaterial({ color: 'green' })
            const mesh = new THREE.Mesh(geometry, material)
            scene.add(mesh)
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
            camera.position.z = 1
            renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight)
            renderer.render(scene, camera)
          }
        }
      })
    })
  }

  // TODO: Find an alternative approach for mapping an unique identifier for each the canvas.
  private hash(robot: RobotViewModel, index: number) {
    return `${robot.name}:${index}}`
  }
}
