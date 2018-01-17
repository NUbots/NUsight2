import { action } from 'mobx'

import { LineChartModel } from './model'

export class LineChartController {
  static of(): LineChartController {
    return new LineChartController()
  }

  @action
  removeOutOfBoundsData(model: LineChartModel) {
    if (model.timestamp < model.timeWindow) {
      return
    }
    const oldestValidTime = model.timestamp - model.timeWindow
    model.robots.forEach(robot => {
      for (const seriesList of robot.series.values()) {
        for (const series of seriesList) {
          series.removeOlderThan(oldestValidTime)
        }
      }
    })
  }
}
