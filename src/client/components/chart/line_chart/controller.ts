import { action } from 'mobx'

import { LineChartModel } from './model'

export class LineChartController {
  static of() {
    return new LineChartController()
  }

  @action
  changeMin = (model: LineChartModel, value: string) => {
    model.yMin = value ? parseInt(value, 10) : 'auto'
  }

  @action
  changeMax = (model: LineChartModel, value: string) => {
    model.yMax = value ? parseInt(value, 10) : 'auto'
  }

  @action
  changeBuffer = (model: LineChartModel, value: string) => {
    model.bufferSeconds = value ? parseInt(value, 10) : 10
  }
}
