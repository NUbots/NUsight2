import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

import { Renderer } from '../../../render2d/renderer'
import { ChartModel } from '../model'

import { LineChartModel } from './model'
import * as style from './style.css'
import { LineChartViewModel } from './view_model'

export type LineChartProps = {
  model: ChartModel
}

@observer
export class LineChart extends Component<LineChartProps> {
  render() {
    const chartModel = this.props.model
    const lineChartModel = LineChartModel.of(this.props.model)
    const viewModel = LineChartViewModel.of(lineChartModel)
    return <div className={style.container}>
      <Renderer
        engine='pixi'
        className={style.field}
        scene={viewModel.scene}
        camera={viewModel.camera} />
    </div>
  }
}
