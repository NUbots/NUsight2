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
    return this.servo.data.concat().sort((a, b) => {
      if (a.time < b.time) {
        return -1
      } else if (a.time > b.time) {
        return 1
      } else {
        return 0
      }
    })
  }

  @computed
  get svgLineSegments() {
    return this.points
      .map((point, index) => {
        // Create a blank line segment for the last data point.
        // This is removed in the .slice() call below.
        if (index === this.points.length - 1) {
          return {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
          }
        }

        return {
          x1: point.time,
          x2: this.points[index + 1].time,
          y1: Math.PI - point.angle,
          y2: Math.PI - this.points[index + 1].angle,
        }
      })
      .slice(0, this.points.length - 1)
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
