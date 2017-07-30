import { computed } from 'mobx'
import { observable } from 'mobx'
import { memoize } from '../../../base/memoize'
import { ChartModel } from '../model'
import { ChartRobotModel } from '../model'

export type LineChartModelOpts = {
  height: number
  model: ChartModel
  width: number
}

export class LineChartModel {
  @observable public height: number
  @observable private model: ChartModel
  @observable public width: number

  constructor(opts: LineChartModelOpts) {
    this.height = opts.height
    this.model = opts.model
    this.width = opts.width
  }

  public static of = memoize((model: ChartModel): LineChartModel => {
    return new LineChartModel({
      height: 0,
      model,
      width: 0,
    })
  })
  
  @computed public get robots(): ChartRobotModel[] {
    return this.model.robots
  }
}
