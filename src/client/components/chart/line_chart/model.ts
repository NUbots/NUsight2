import { computed } from 'mobx'
import { observable } from 'mobx'

import { memoize } from '../../../base/memoize'
import { ChartModel } from '../model'
import { ChartRobotModel } from '../model'

export type LineChartModelOpts = {
  model: ChartModel
  timestamp: number
  timeWindow: number
}

export class LineChartModel {
  @observable private model: ChartModel
  @observable timestamp: number
  // TODO Olejniczak add comment
  @observable timeWindow: number

  constructor(opts: LineChartModelOpts) {
    this.model = opts.model
    this.timestamp = opts.timestamp
    this.timeWindow = opts.timeWindow
  }

  static of = memoize((model: ChartModel): LineChartModel => {
    return new LineChartModel({
      model,
      timestamp: 0,
      timeWindow: 20,
    })
  })

  @computed get robots(): ChartRobotModel[] {
    return this.model.robots
  }
}
