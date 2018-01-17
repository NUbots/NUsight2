import { computed } from 'mobx'
import { observable } from 'mobx'

import { memoize } from '../../../base/memoize'
import { ChartModel } from '../model'
import { ChartRobotModel } from '../model'

export type LineChartModelOpts = {
  height: number
  model: ChartModel
  timestamp: number
  timeWindow: number
  width: number
}

export class LineChartModel {
  @observable height: number
  @observable private model: ChartModel
  @observable timestamp: number
  // TODO Olejniczak add comment
  @observable timeWindow: number
  @observable width: number

  constructor(opts: LineChartModelOpts) {
    this.height = opts.height
    this.model = opts.model
    this.timestamp = opts.timestamp
    this.timeWindow = opts.timeWindow
    this.width = opts.width
  }

  static of = memoize((model: ChartModel): LineChartModel => {
    return new LineChartModel({
      height: 0,
      model,
      timestamp: 0,
      timeWindow: 20,
      width: 0,
    })
  })

  @computed get robots(): ChartRobotModel[] {
    return this.model.robots
  }
}
