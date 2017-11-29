import { autorun } from 'mobx'
import { Component } from 'react'
import * as React from 'react'
import { VisionRadarModel } from './model'

export class VisionRadarView extends Component<{ model: VisionRadarModel }> {
  private canvas: HTMLCanvasElement | null
  private destroy: () => void

  public componentDidMount() {
    this.destroy = autorun(() => this.renderScene())
  }

  public componentWillUnmount() {
    this.destroy()
  }

  public render() {
    return (
      <div>
        <h1>Vision Radar</h1>
        <canvas ref={this.onRef}/>
      </div>
    )
  }

  private renderScene() {

  }

  private onRef = (canvas: HTMLCanvasElement | null) => {
    this.canvas = canvas
  }
}
