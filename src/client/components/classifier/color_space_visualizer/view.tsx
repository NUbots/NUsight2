import { WheelEvent } from 'react'
import { MouseEvent } from 'react'
import { Component } from 'react'
import * as React from 'react'
import { ColorSpaceVisualizerModel } from './model'
import { ColorSpaceVisualizerViewModel } from './view_model'

export type ColorSpaceVisualizerProps = {
  model: ColorSpaceVisualizerModel,
  componentDidMount?(): void,
  componentWillUnmount?(): void
  onMouseDown?(x: number, y: number): void
  onMouseMove?(x: number, y: number): void
  onMouseUp?(x: number, y: number): void
  onWheel(deltaY: number, preventDefault: () => void): void
}

export class ColorSpaceVisualizer extends Component<ColorSpaceVisualizerProps> {
  private viewModel = ColorSpaceVisualizerViewModel.of(this.props.model)

  public render() {
    const { width, height } = this.viewModel
    return (
      <canvas
        ref={this.onCanvasRef}
        width={width}
        height={height}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onWheel={this.onWheel}
      />
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

  private onMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    this.props.onMouseDown && this.props.onMouseDown(e.nativeEvent.layerX, e.nativeEvent.layerY)
  }

  private onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    this.props.onMouseMove && this.props.onMouseMove(e.nativeEvent.layerX, e.nativeEvent.layerY)
  }

  private onMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    this.props.onMouseUp && this.props.onMouseUp(e.nativeEvent.layerX, e.nativeEvent.layerY)
  }

  private onWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    this.props.onWheel && this.props.onWheel(e.deltaY, () => e.preventDefault())
  }
}
