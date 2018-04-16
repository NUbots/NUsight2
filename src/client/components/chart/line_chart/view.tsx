import { action } from 'mobx'
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

    const min = viewModel.minValue.toPrecision(3)
    const max = viewModel.maxValue.toPrecision(3)
    const sec = lineChartModel.bufferSeconds.toPrecision(3)

    return (<>
      <div className={style.topBar}>
        <label className={style.topBarItem}>
          Minimum Value
          <input className={style.topBarInput} type='number' onChange={this.changeMin} placeholder={`(${min})`}/>
        </label>
        <label className={style.topBarItem}>
          Maximum Value
          <input className={style.topBarInput} type='number' onChange={this.changeMax} placeholder={`(${max})`} />
        </label>
        <label className={style.topBarItem}>
          View Seconds
          <input className={style.topBarInput} type='number' onChange={this.changeBuffer} placeholder={`(${sec})`} />
        </label>
      </div>
      <div className={style.container}>
        <Renderer
          engine='svg'
          className={style.field}
          scene={viewModel.scene}
          camera={viewModel.camera} />
      </div>
    </>)
  }

  @action
  private changeMin = (event: any) => {
    const lineChartModel = LineChartModel.of(this.props.model)
    if (event.target.value) {
      lineChartModel.yMin = parseInt(event.target.value, 10)
    } else {
      lineChartModel.yMin = 'auto'
    }
  }

  @action
  private changeMax = (event: any) => {
    const lineChartModel = LineChartModel.of(this.props.model)
    if (event.target.value) {
      lineChartModel.yMax = parseInt(event.target.value, 10)
    } else {
      lineChartModel.yMax = 'auto'
    }
  }

  @action
  private changeBuffer = (event: any) => {
    const lineChartModel = LineChartModel.of(this.props.model)
    if (event.target.value) {
      lineChartModel.bufferSeconds = parseInt(event.target.value, 10)
    } else {
      lineChartModel.bufferSeconds = 10
    }
  }
}
