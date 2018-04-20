import { action } from 'mobx'

import { LineChartModel } from './model'

export class LineChartController {

  constructor(private model: LineChartModel) {
    this.model = model
  }

  static of(model: LineChartModel) {
    return new LineChartController(model)
  }

  @action
  changeMin = (event: any) => {
    if (event.target.value) {
      this.model.yMin = parseInt(event.target.value, 10)
    } else {
      this.model.yMin = 'auto'
    }
  }

  @action
  changeMax = (event: any) => {
    if (event.target.value) {
      this.model.yMax = parseInt(event.target.value, 10)
    } else {
      this.model.yMax = 'auto'
    }
  }

  @action
  changeBuffer = (event: any) => {
    if (event.target.value) {
      this.model.bufferSeconds = parseInt(event.target.value, 10)
    } else {
      this.model.bufferSeconds = 10
    }
  }
}
