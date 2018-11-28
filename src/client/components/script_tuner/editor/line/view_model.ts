// Show an individual script line editor
// The view will be a simple line chart
// When hovering over a point in the chart it will show  the valid positions based on RPM
// When scrolling the mouse wheel it will move up/down based limited by the surrounding points
// It will also show the current position of the robots limb

import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Servo } from '../../model'

export class LineEditorViewModel {
  constructor(private servo: Servo) {
  }

  static of = createTransformer((servo: Servo): LineEditorViewModel => {
    return new LineEditorViewModel(servo)
  })

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
        x1: point.time,
        x2: this.points[i + 1].time,
        y1: Math.PI - point.angle,
        y2: Math.PI - this.points[i + 1].angle,
      })
    }

    return segments
  }

  @computed
  get svgPoints() {
    return this.points.map(point => {
      return {
        x: point.time,
        y: Math.PI - point.angle,
      }
    })
  }
}
