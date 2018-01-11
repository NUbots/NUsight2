import { action } from 'mobx'
import { autorun } from 'mobx'
import { IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { CanvasRenderer } from '../../../canvas/renderer'
import { LineChartController } from './controller'
import { LineChartModel } from './model'
import * as style from './style.css'
import { LineChartViewModel } from './view_model'
import ReactResizeDetector from 'react-resize-detector'

export type LineChartProps = {
  controller: LineChartController
  model: LineChartModel
}

@observer
export class LineChart extends Component<LineChartProps> {
  private chart: HTMLCanvasElement
  private rafId: number
  private renderer: CanvasRenderer
  private stopAutorun: IReactionDisposer

  public componentDidMount() {
    if (!this.chart) {
      return
    }
    const context: CanvasRenderingContext2D = this.chart.getContext('2d')!
    this.renderer = CanvasRenderer.of(context)
    this.stopAutorun = autorun(() => this.renderChart())
    this.rafId = requestAnimationFrame(this.onRequestAnimationFrame)
  }

  public componentWillUnmount() {
    cancelAnimationFrame(this.rafId)
  }

  public render() {
    return (
      <div className={style.lineChart}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.onChartResize} />
        <canvas className={style.lineChart__canvas} ref={this.onRef} width={this.props.model.width} height={this.props.model.height} />
      </div>
    )
  }

  private onRequestAnimationFrame = (timestamp: number) => {
    this.rafId = requestAnimationFrame(this.onRequestAnimationFrame)
    this.props.controller.onRequestAnimationFrame(this.props.model, timestamp)
  }

  private onRef = (chart: HTMLCanvasElement) => {
    this.chart = chart
  }

  private renderChart() {
    const viewModel = LineChartViewModel.of(this.props.model)
    this.renderer.render(viewModel.chart, viewModel.camera)
    this.props.controller.onRenderChart(this.props.model)
  }

  @action
  private onChartResize = (width: number, height: number)  => {
    const dpi = window.devicePixelRatio
    this.props.controller.onChartResize(this.props.model, width * dpi, height * dpi)
  }
}
