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
    this.removeOutOfBoundsData(model)
  }

  @action
  public onRequestAnimationFrame(model: LineChartModel, timestamp: number) {
    model.timestamp = timestamp / 1000
  }

  public onRenderChart(model: LineChartModel) {
    this.removeOutOfBoundsData(model)
  }

  @action
  private removeOutOfBoundsData(model: LineChartModel) {
    // TODO Olejniczak
  }
}
