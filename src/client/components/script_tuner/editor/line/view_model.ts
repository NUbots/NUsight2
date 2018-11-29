// Show an individual script line editor
// The view will be a simple line chart
// When hovering over a point in the chart it will show  the valid positions based on RPM
// When scrolling the mouse wheel it will move up/down based limited by the surrounding points
// It will also show the current position of the robots limb

import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Servo } from '../../model'
import { EditorViewModel } from '../view_model'

type LineEditorViewModelOptions = {
  servo: Servo,
  editorViewModel: EditorViewModel
}

export class LineEditorViewModel {
  private servo: Servo
  private editorViewModel: EditorViewModel

  constructor(options: LineEditorViewModelOptions) {
    this.servo = options.servo
    this.editorViewModel = options.editorViewModel
  }

  static of = createTransformer((options: LineEditorViewModelOptions): LineEditorViewModel => {
    return new LineEditorViewModel(options)
  })

  @computed
  get cellWidth() {
    return this.editorViewModel.cellWidth * this.editorViewModel.scaleX
  }

  @computed
  get width() {
    return this.points.length * this.cellWidth
  }

  @computed
  get height() {
    return this.editorViewModel.height
  }

  @computed
  get points() {
    return this.servo.frames.concat().sort((a, b) => a.time - b.time)
  }

  @computed
  get svgLineSegments() {
    const segments = []

    for (let i = 0; i < this.points.length - 1; i++) {
      const point = this.points[i]

      segments.push({
        x1: point.time * this.cellWidth,
        x2: this.points[i + 1].time * this.cellWidth,
        y1: this.scaleY(Math.PI - point.angle),
        y2: this.scaleY(Math.PI - this.points[i + 1].angle),
      })
    }

    return segments
  }

  @computed
  get svgPoints() {
    return this.points.map(point => {
      return {
        x: point.time * this.cellWidth,
        y: this.scaleY(Math.PI - point.angle),
        label: `(${point.time}, ${point.angle.toFixed(2)})`,
      }
    })
  }

  scaleY(value: number) {
    return this.scale(value, -Math.PI, Math.PI, -this.height / 2, this.height / 2)
  }

  scale(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
  }
}
