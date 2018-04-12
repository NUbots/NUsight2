import * as bounds from 'binary-search-bounds'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Transform } from '../../../math/transform'
import { Vector2 } from '../../../math/vector2'
import { LineAppearance } from '../../../render2d/appearance/line_appearance'
import { LineGeometry } from '../../../render2d/geometry/line_geometry'
import { PathGeometry } from '../../../render2d/geometry/path_geometry'
import { Group } from '../../../render2d/object/group'
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
    const maxValue = this.model.yMax === 'auto' ? this.maxValue : this.model.yMax
    const minValue = this.model.yMin === 'auto' ? this.minValue : this.model.yMin
    const yScale = 1 / (maxValue - minValue)
    const xScale = 1 / this.model.viewSeconds

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

    const maxValue = this.model.yMax === 'auto' ? this.maxValue : this.model.yMax
    const minValue = this.model.yMin === 'auto' ? this.minValue : this.model.yMin

    return Group.of({
      transform: Transform.of({
        translate: {
          x: -(this.model.now - this.model.viewSeconds / 2),
          y: -(minValue + (maxValue - minValue) / 2),
        },
      }),
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

    // Get our min and max values
    const max = this.model.yMax === 'auto' ? this.maxValue : this.model.yMax
    const min = this.model.yMin === 'auto' ? this.minValue : this.model.yMin

    // Work out the distance between our major and minor grid lines
    const nMinor = 4
    const range = max - min
    const digits = Math.floor(Math.log10(range))
    const major = Math.pow(10, digits)
    const minor = major / nMinor

    const lines: Array<Shape<LineGeometry>> = []

    // Make our major and minor lines
    let lineNo = 0
    for (let y = Math.floor(min / major) * major - major; y <= max + major; y += minor) {
      const geometry = LineGeometry.of({
        origin: Vector2.of(Number.MIN_SAFE_INTEGER, y),
        target: Vector2.of(Number.MAX_SAFE_INTEGER, y),
      })

      if (lineNo % nMinor === 0) {
        // Major gridline
        lines.push(Shape.of(geometry, LineAppearance.of({
          strokeStyle: '#444444',
          lineWidth: 1,
          nonScalingStroke: true,
        })))
      } else {
        // Minor gridline
        lines.push(Shape.of(geometry, LineAppearance.of({
          strokeStyle: '#888888',
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

    return Group.of({
    })
  }

  @computed
  get chart() {
    return Group.of({
      children: this.dataSeries.map(series => this.makeLines(series)),
    })
  }

  @computed
  private get maxValue(): number {

    return this.dataSeries.reduce((maxValue, series: DataSeries) => {

      // Get the range we are viewing
      let end = this.model.now + series.timeDelta
      let start = end - this.model.viewSeconds

      const values = series.series
      end = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - end))
      start = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - start))

      return values.slice(start, end).reduce((max, value) => {
        return Math.max(max, value.y)
      }, maxValue)
    }, -Number.MAX_VALUE)
  }

  @computed
  private get minValue(): number {
    return this.dataSeries.reduce((minValue, series: DataSeries) => {

      // Get the range we are viewing
      let end = this.model.now + series.timeDelta
      let start = end - this.model.viewSeconds

      const values = series.series
      end = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - end))
      start = Math.max(0, bounds.lt(values, Vector2.of(), p => p.x - start))

      return values.slice(start, end).reduce((min, value) => {
        return Math.min(min, value.y)
      }, minValue)
    }, Number.MAX_VALUE)
  }

  private makeLines(series: DataSeries): Group {

    // Get the range we are viewing
    let end = this.model.now + series.timeDelta
    let start = end - this.model.viewSeconds

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
