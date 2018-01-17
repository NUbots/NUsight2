import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { SVGRenderer } from '../../../render2d/svg_renderer'
import { ExampleCheckboxTree } from '../checkbox_tree/example'

import { LineChartController } from './controller'
import { LineChartModel } from './model'
import * as style from './style.css'
import { LineChartViewModel } from './view_model'

export type LineChartProps = {
  controller: LineChartController
  model: LineChartModel
}

@observer
export class LineChart extends Component<LineChartProps> {
  private rafId: number

  componentDidMount() {
    this.rafId = requestAnimationFrame(this.onRequestAnimationFrame)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId)
  }

  render() {
    const model = this.props.model
    const viewModel = LineChartViewModel.of(model)
    return (
      <div className={style.lineChart}>
        <div className={style.lineChart__canvasWrapper}>
          <SVGRenderer
            className={style.field}
            scene={viewModel.chart}
            camera={viewModel.camera}
          />
        </div>
        <div className={style.lineChart__sidebar}>
          <ExampleCheckboxTree></ExampleCheckboxTree>
        </div>
      </div>
    )
  }

  private onRequestAnimationFrame = (timestamp: number) => {
    this.rafId = requestAnimationFrame(this.onRequestAnimationFrame)
    this.props.controller.removeOutOfBoundsData(this.props.model)
  }
}
