import { createTransformer } from 'mobx-utils'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { LineAppearance } from '../../../render2d/appearance/line_appearance'
import { LineGeometry } from '../../../render2d/geometry/line_geometry'
import { Group } from '../../../render2d/object/group'
import { Shape } from '../../../render2d/object/shape'
import { Transform } from '../../../math/transform'
import { Vector2 } from '../../../math/vector2'
import { DataSeries } from '../model'
import { TreeData } from '../model'
import { ChartModel } from '../model'
import { CheckedState } from '../../checkbox_tree/model'

export class LineChartViewModel {
  public constructor(private model: ChartModel) {
  }

  public static of = createTransformer((model: ChartModel): LineChartViewModel => {
    return new LineChartViewModel(model)
  })

  @computed
  public get camera(): Transform {
    const maxValue = this.maxValue
    const minValue = this.minValue
    const yScale = 1 / Math.max(1, (maxValue - minValue)) // Show all the data (autoscale)
    const xScale = 1 / 5 // Show 5 seconds

    return Transform.of({
      scale: {
        x: xScale,
        y: yScale,
      },
      translate: {
        x: Date.now() / 1000,
        y: minValue + (maxValue - minValue) / 2,
      }
    })
  }

  @computed
  public get dataSeries(): DataSeries[] {
    const series : DataSeries[] = []
    const queue: Array<TreeData | DataSeries> = [this.model.treeData]

    while (queue.length > 0) {
      const elem = queue.pop()!

      if (elem instanceof DataSeries && elem.checked === CheckedState.Checked) {
        series.push(elem)
      }
      else if (!(elem instanceof DataSeries)) {
        queue.push(...elem.values())
      }
    }

    return series
  }

  @computed
  public get chart(): Group {
    return Group.of({
      children: this.dataSeries.map(series => LineChartViewModel.makeLines(series))
    })
  }

  private get maxValue(): number {
    if (this.dataSeries.length === 0) {
      return 1
    }

    return this.dataSeries.reduce((maxValue, series : DataSeries) => {
      return series.series.reduce((max, value) => {
         return Math.max(max, value.y)
      }, maxValue);
    }, -Number.MAX_VALUE)
  }

  private get minValue(): number {
    if (this.dataSeries.length === 0) {
      return -1
    }

    return this.dataSeries.reduce((minValue, series : DataSeries) => {
      return series.series.reduce((min, value) => {
         return Math.min(min, value.y)
      }, minValue);
    }, Number.MAX_VALUE)
  }

  private static makeLines(series: DataSeries): Group {
    const values = series.series.sort((a, b) => a.x > b.x ? 1 : (a.x < b.x ? -1 : 0))
    const shapes : Shape<LineGeometry>[] = []

    const appearance = LineAppearance.of({
      strokeStyle: series.color,
      lineWidth: 1000
    })

    for (let i = 0; i < values.length - 1; i++) {
      const shape = Shape.of(
        LineGeometry.of({
          origin: values[i],
          target: values[i + 1]
        }),
        appearance
      )

      shapes.push(shape)
    }

    // TODO: add time delta to series and apply here
    return Group.of({
      children: shapes
    })
  }
}
