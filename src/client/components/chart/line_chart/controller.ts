import { action } from 'mobx'
import { LineChartModel } from './model'

export class LineChartController {
  public static of(): LineChartController {
    return new LineChartController()
  }

  @action
  public onChartResize(model: LineChartModel, width: number, height: number) {
    model.width = width
    model.height = height
  }

  @action
  public onRequestAnimationFrame(model: LineChartModel, timestamp: number) {
    // TODO Annable/Olejniczak add requestAnimationFrame to browser clock so this is not a thing
    model.timestamp = timestamp / 1000
  }

  public onRenderChart(model: LineChartModel) {
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
