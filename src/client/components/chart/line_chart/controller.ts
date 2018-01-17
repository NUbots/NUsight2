import { action } from 'mobx'

import { LineChartModel } from './model'

export class LineChartController {
  static of(): LineChartController {
    return new LineChartController()
  }

  @action
  onChartResize(model: LineChartModel, width: number, height: number) {
    model.width = width
    model.height = height
  }

  @action
  onRequestAnimationFrame(model: LineChartModel, timestamp: number) {
    // TODO Annable/Olejniczak add requestAnimationFrame to browser clock so this is not a thing
    model.timestamp = timestamp / 1000
  }

  onRenderChart(model: LineChartModel) {
    this.removeOutOfBoundsData(model)
  }

  private removeOutOfBoundsData(model: LineChartModel) {
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
