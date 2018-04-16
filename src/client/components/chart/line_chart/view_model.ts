import * as bounds from 'binary-search-bounds'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Transform } from '../../../math/transform'
import { Vector2 } from '../../../math/vector2'
import { BasicAppearance } from '../../../render2d/appearance/basic_appearance'
import { LineAppearance } from '../../../render2d/appearance/line_appearance'
import { LineGeometry } from '../../../render2d/geometry/line_geometry'
import { PathGeometry } from '../../../render2d/geometry/path_geometry'
import { TextGeometry } from '../../../render2d/geometry/text_geometry'
import { Group } from '../../../render2d/object/group'
import { Geometry } from '../../../render2d/object/shape'
import { Shape } from '../../../render2d/object/shape'
import { CheckedState } from '../../checkbox_tree/model'
import { DataSeries } from '../model'
import { TreeData } from '../model'

import { LineChartModel } from './model'

export class LineChartViewModel {
  constructor(private model: LineChartModel) {
  }

  static of = createTransformer((model: LineChartModel): LineChartViewModel => {
    return new LineChartViewModel(model)
  })

  @computed
  get camera(): Transform {
    const yScale = 0.9 / (this.maxValue - this.minValue) // 0.9 so there is a little extra above and below the plot
    const xScale = 1 / this.model.bufferSeconds

    return Transform.of({
      scale: {
        x: xScale,
        y: yScale,
      },
    })
  }

  @computed
  get dataSeries(): DataSeries[] {
    const series: DataSeries[] = []
    const queue: Array<TreeData | DataSeries> = [this.model.treeData]

    while (queue.length > 0) {
      const elem = queue.pop()!

      if (elem instanceof DataSeries && elem.checked === CheckedState.Checked) {
        series.push(elem)
      } else if (!(elem instanceof DataSeries)) {
        queue.push(...elem.values())
      }
    }

    return series
  }

  @computed
  get scene(): Group {
    return Group.of({
      children: [
        this.chart,
        this.axis,
      ],
    })
  }

  @computed
  get axis(): Group {
    return Group.of({
      children: [
        this.yAxis,
        this.xAxis,
      ],
    })
  }

  @computed
  get yAxis(): Group {

    // Work out the distance between our major and minor grid lines
    const nMinor = 4
    const range = this.maxValue - this.minValue
    const digits = Math.floor(Math.log10(range * 0.5))
    const major = Math.pow(10, digits)
    const minor = major / nMinor
    const offset = this.minValue + (this.maxValue - this.minValue) / 2

    const lines: Array<Shape<Geometry>> = []

    // Make our major and minor lines
    let lineNo = 0
    for (let y = Math.floor(this.minValue / major) * major - major; y <= this.maxValue + major; y += minor) {
      const geometry = LineGeometry.of({
        origin: Vector2.of(-this.model.bufferSeconds / 2, y - offset),
        target: Vector2.of(this.model.bufferSeconds / 2, y - offset),
      })

      if (lineNo % nMinor === 0) {
        // Major gridline
        lines.push(Shape.of(geometry, LineAppearance.of({
          strokeStyle: '#555555',
          lineWidth: 1,
          nonScalingStroke: true,
        })))

        lines.push(Shape.of(TextGeometry.of({
          text: y.toString(),
          worldScale: true,
          textAlign: 'end',
          fontSize: '1em',
          x: this.model.bufferSeconds / 2,
          y: y - offset,
        }), BasicAppearance.of({
          fillStyle: '#000000',
          strokeStyle: 'transparent',
        })))

      } else {
        // Minor gridline
        lines.push(Shape.of(geometry, LineAppearance.of({
          strokeStyle: '#999999',
          lineWidth: 0.5,
          nonScalingStroke: true,
        })))
      }

      lineNo++
    }

    return Group.of({
      children: lines,
    })
  }

  @computed
  get xAxis(): Group {

    // Work out our min/max value
    const max = this.model.now
    const min = max - this.model.bufferSeconds
    const yRange = this.maxValue - this.minValue

    // Work out the distance between our major and minor grid lines
    const nMinor = 4
    const range = this.model.bufferSeconds
    const digits = Math.floor(Math.log10(range))
    const major = Math.pow(10, digits)
    const minor = major / nMinor
    const offset = min + (max - min) / 2

    const lines: Array<Shape<Geometry>> = []

    // Make our major and minor lines
    let lineNo = 0
    for (let x = Math.floor(min / major) * major - major; x <= max + major; x += minor) {
      const geometry = LineGeometry.of({
        origin: Vector2.of(x - offset, -yRange),
        target: Vector2.of(x - offset, yRange),
      })

      if (lineNo % nMinor === 0) {
        // Major gridline
        lines.push(Shape.of(geometry, LineAppearance.of({
          strokeStyle: '#555555',
          lineWidth: 1,
          nonScalingStroke: true,
        })))

      } else {
        // Minor gridline
        lines.push(Shape.of(geometry, LineAppearance.of({
          strokeStyle: '#999999',
          lineWidth: 0.5,
          nonScalingStroke: true,
        })))
      }

      lineNo++
    }

    return Group.of({
      children: lines,
    })
  }

  @computed
  get chart() {

    // Get our min and max values
    const minValue = this.model.yMin === 'auto' ? this.minValue : this.model.yMin
    const maxValue = this.model.yMax === 'auto' ? this.maxValue : this.model.yMax

    return Group.of({
      transform: Transform.of({
        translate: {
          x: -(this.model.now - this.model.bufferSeconds / 2),
          y: -(minValue + (maxValue - minValue) / 2),
        },
      }),
      children: this.dataSeries.map(series => this.makeLines(series)),
    })
  }

  @computed
  get maxValue(): number {
    if (this.model.yMax !== 'auto') {
      return this.model.yMax
    } else if (this.dataSeries.length === 0) {
      return 1
    } else {

      return this.dataSeries.reduce((maxValue, series: DataSeries) => {

        // Get the range we are viewing
        let end = this.model.now + series.timeDelta
        let start = end - this.model.bufferSeconds

        const values = series.series
        end = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - end))
        start = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - start))

        return values.slice(start, end).reduce((max, value) => {
          return Math.max(max, value.y)
        }, maxValue)
      }, -Number.MAX_VALUE)
    }
  }

  @computed
  get minValue(): number {
    if (this.model.yMin !== 'auto') {
      return this.model.yMin
    } else if (this.dataSeries.length === 0) {
      return -1
    } else {
      return this.dataSeries.reduce((minValue, series: DataSeries) => {

        // Get the range we are viewing
        let end = this.model.now + series.timeDelta
        let start = end - this.model.bufferSeconds

        const values = series.series
        end = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - end))
        start = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - start))

        return values.slice(start, end).reduce((min, value) => {
          return Math.min(min, value.y)
        }, minValue)
      }, Number.MAX_VALUE)
    }
  }

  private makeLines(series: DataSeries): Group {

    // Get the range we are viewing
    let end = this.model.now + series.timeDelta
    let start = end - this.model.bufferSeconds

    let values = series.series
    end = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - end))
    start = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - start))
    values = values.slice(start, end)

    const appearance = LineAppearance.of({
      strokeStyle: series.color,
      lineWidth: 2,
      nonScalingStroke: true,
    })

    const shape = Shape.of(
      PathGeometry.of(values),
      appearance,
    )

    // Apply our time delta
    return Group.of({
      transform: Transform.of({
        translate: Vector2.of(-series.timeDelta, 0),
      }),
      children: [shape],
    })
  }
}
