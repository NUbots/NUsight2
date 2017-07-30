import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { LineAppearance } from '../../../canvas/appearance/line_appearance'
import { PathGeometry } from '../../../canvas/geometry/path_geometry'
import { Group } from '../../../canvas/object/group'
import { Shape } from '../../../canvas/object/shape'
import { Transform } from '../../../math/transform'
import { Vector2 } from '../../../math/vector2'
import { SeriesModel, ChartRobotModel } from '../model'
import { LineChartModel } from './model'

export class LineChartViewModel {
  public constructor(private model: LineChartModel) {
  }

  public static of = createTransformer((model: LineChartModel): LineChartViewModel => {
    return new LineChartViewModel(model)
  })

  @computed
  public get camera(): Transform {
    const maxValue = this.maxValue
    const minValue = this.minValue
    const scale = this.model.height / Math.max(1, (maxValue - minValue))

    return Transform.of({
      scale: {
        x: scale,
        y: scale,
      },
      translate: {
        x: 0,
        y: this.model.height - ((maxValue - minValue) * 0.5),
      },
    })
  }

  @computed
  public get chart(): Group {
    return Group.of({
      children: this.robots.map(robot => this.seriesList(robot.series)),
    })
  }

  private get maxValue(): number {
    return this.robots.reduce((maxValue, robot) => {
      for (const seriesList of robot.series.values()) {
        maxValue = seriesList.reduce((maxValue, series) => {
          return Math.max(maxValue, series.maxValue)
        }, maxValue)
      }
      return maxValue
    }, -Number.MAX_VALUE)
  }

  private get minValue(): number {
    return this.robots.reduce((minValue, robot) => {
      for (const seriesList of robot.series.values()) {
        minValue = seriesList.reduce((minValue, series) => {
          return Math.max(minValue, series.minValue)
        }, minValue)
      }
      return minValue
    }, Number.MAX_VALUE)
  }

  @computed
  private get robots(): ChartRobotModel[] {
    return this.model.robots
      .filter(robot => robot.visible)
  }

  private seriesList(series: Map<string, SeriesModel[]>): Group {
    let paths: Shape[] = []
    for (const seriesList of series.values()) {
      const shapes = seriesList.map(series => {
        const path = series.data.map(d => {
          return Vector2.of(
            (Date.now() / 1000) - d.timestamp,
            d.value,
          )
        })
        return Shape.of(
          PathGeometry.of(path),
          LineAppearance.of(),
        )
      })
      paths.push(...shapes)
    }
    return Group.of({
      children: paths,
    })
  }
}
