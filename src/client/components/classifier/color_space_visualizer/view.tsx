import { autorun } from 'mobx'
import { Component } from 'react'
import * as React from 'react'
import { ColorSpaceVisualzerModel } from './model'

export class ColorSpaceVisualizer extends Component<{
  model: ColorSpaceVisualzerModel
}> {
  private canvas: HTMLCanvasElement
  private destroy: () => void

  render() {
    const { width, height } = this.props.model
    return (
      <canvas ref={this.onCanvasRef} width={width} height={height}/>
    )
  }

  componentDidMount() {
    this.destroy = autorun(() => this.renderScene())
  }

  componentWillUnmount() {
    this.destroy()
  }

  private renderScene() {

  }

  private onCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      this.canvas = canvas
    }
  }
}
