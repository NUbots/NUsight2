import { observable } from 'mobx'
import { memoize } from '../../../base/memoize'
import { ChartRobotModel } from '../model'

export type LineChartModelOpts = {
  height: number
  robots: ChartRobotModel[]
  width: number
}

export class LineChartModel {
  @observable public height: number
  @observable public robots: ChartRobotModel[]
  @observable public width: number

  constructor(opts: LineChartModelOpts) {
    this.height = opts.height
    this.robots = opts.robots
    this.width = opts.width
  }

  public static of = memoize((robots: ChartRobotModel[]): LineChartModel => {
    return new LineChartModel({
      height: 0,
      robots,
      width: 0
    })
  })
}
