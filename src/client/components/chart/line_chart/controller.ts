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
}
