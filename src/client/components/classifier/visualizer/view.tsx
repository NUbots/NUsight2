import { computed } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import * as React from 'react'

import { Canvas } from '../../three/three'
import { Three } from '../../three/three'

import { VisualizerController } from './controller'
import { VisualizerModel } from './model'
import * as styles from './styles.css'
import { VisualizerViewModel } from './view_model'

export type VisualiserProps = {
  onMouseDown?(x: number, y: number): void
  onMouseMove?(x: number, y: number): void
  onMouseUp?(x: number, y: number): void
  onWheel?(deltaY: number, preventDefault: () => void): void
}

@observer
export class VisualizerView extends Component<VisualiserProps & {
  model: VisualizerModel
}> {
  static of(model: VisualizerModel) {
    const controller = VisualizerController.of(model)
    return (props: VisualiserProps) => <VisualizerView
      {...props}
      model={model}
      onMouseDown={controller.onMouseDown}
      onMouseMove={controller.onMouseMove}
      onMouseUp={controller.onMouseUp}
      onWheel={controller.onWheel}
    />
  }

  render() {
    return (
      <div className={styles.visualiser}>
        <Three
          stage={this.stage}
          onMouseDown={this.props.onMouseDown}
          onMouseMove={this.props.onMouseMove}
          onMouseUp={this.props.onMouseUp}
          onWheel={this.props.onWheel}
        />
      </div>
    )
  }

  private stage = (canvas: Canvas) => {
    const viewModel = VisualizerViewModel.of(canvas, this.props.model)
    return computed(() => ({ scene: viewModel.scene, camera: viewModel.camera }))
  }
}
