import { createTransformer } from 'mobx'
import { computed } from 'mobx'

import { Transform } from '../../../math/transform'
import { LineAppearance } from '../../../render2d/appearance/line_appearance'
import { PathGeometry } from '../../../render2d/geometry/path_geometry'
import { Group } from '../../../render2d/object/group'
import { Shape } from '../../../render2d/object/shape'
import { ChartRobotModel, SeriesModel } from '../model'

import { LineChartModel } from './model'

export class LineChartViewModel {
  constructor(private model: LineChartModel) {
  }

  static of = createTransformer((model: LineChartModel): LineChartViewModel => {
    return new LineChartViewModel(model)
  })

  @computed
  get camera(): Transform {
    const maxValue = this.maxValue
    const minValue = this.minValue
    const scaleX = this.model.timeWindow
    const scaleY = (maxValue - minValue)

    return Transform.of({
      scale: {
        x: scaleX,
        y: -scaleY,
      },
    })
  }

  @computed
  get chart(): Group {
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
          return Math.min(minValue, series.minValue)
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
    const paths: Array<Shape<PathGeometry>> = []
    for (const seriesList of series.values()) {
      const shapes = seriesList.map(series => {
        return Shape.of(
          PathGeometry.of(series.data),
          LineAppearance.of({
            lineWidth: 0.01,
          }),
        )
      })
      paths.push(...shapes)
    }
    return Group.of({
      children: paths,
      transform: Transform.of({
        translate: {
          x: -this.model.timestamp,
          y: 0,
        },
      }),
    })
  }
}
