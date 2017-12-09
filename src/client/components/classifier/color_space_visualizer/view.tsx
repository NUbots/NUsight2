import { Component } from 'react'
import * as React from 'react'
import { ColorSpaceVisualizerModel } from './model'
import { ColorSpaceVisualizerViewModel } from './view_model'

export type ColorSpaceVisualizerProps = {
  model: ColorSpaceVisualizerModel,
  componentDidMount?(): void,
  componentWillUnmount?(): void
}

export class ColorSpaceVisualizer extends Component<ColorSpaceVisualizerProps> {
  private viewModel = ColorSpaceVisualizerViewModel.of(this.props.model)

  public render() {
    const { width, height } = this.viewModel
    return (
      <canvas ref={this.onCanvasRef} width={width} height={height}/>
    )
  }

  public componentDidMount() {
    this.props.componentDidMount && this.props.componentDidMount()
  }

  public componentWillUnmount() {
    this.props.componentWillUnmount && this.props.componentWillUnmount()
  }

  private onCanvasRef = (canvas: HTMLCanvasElement | null) => {
    this.viewModel.canvas = canvas
  }
}
