import { Component } from 'react'
import * as React from 'react'
import { ColorSpaceVisualizerViewModel } from './view_model'

export type ColorSpaceVisualizerProps = {
  viewModel: ColorSpaceVisualizerViewModel,
  componentDidMount?(): void,
  componentWillUnmount?(): void,
}

export class ColorSpaceVisualizer extends Component<ColorSpaceVisualizerProps> {
  public render() {
    const { width, height } = this.props.viewModel
    return (
      <canvas ref={this.onCanvasRef} width={width} height={height}/>
    )
  }

  private onCanvasRef = (canvas: HTMLCanvasElement | null) => {
    this.props.viewModel.canvas = canvas
  }

  componentDidMount() {
    this.props.componentDidMount && this.props.componentDidMount()
  }

  componentWillUnmount() {
    this.props.componentWillUnmount && this.props.componentWillUnmount()
  }
}
