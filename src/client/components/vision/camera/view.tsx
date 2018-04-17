import { observer } from 'mobx-react'
import { autorun } from 'mobx'
import { action } from 'mobx'
import * as React from 'react'
import * as styles from './styles.css'
import { Component } from 'react'
import { CameraViewModel } from './view_model'

@observer
export class CameraView extends Component<{ viewModel: CameraViewModel }> {
  private destroy: () => void = () => {}

  componentDidMount() {
    this.destroy = autorun(() => this.renderScene(), {
      scheduler: requestAnimationFrame,
    })
  }

  componentWillUnmount() {
    this.destroy()
  }

  render() {
    return (
      <div className={styles.container}>
        <canvas className={styles.canvas} width={640} height={480} ref={this.onRef}/>
      </div>
    )
  }

  @action
  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.props.viewModel.canvas = canvas
  }

  private renderScene() {
    const { viewModel } = this.props
    const { renderer, scene, camera } = viewModel
    if (renderer) {
      renderer.render(scene, camera)
    }
  }
}
