import { computed } from 'mobx'
import { observable } from 'mobx'

import { memoize } from '../../../base/memoize'
import { ChartModel } from '../model'

export type LineChartModelOpts = {
  model: ChartModel
}

export class LineChartModel {
  @observable model: ChartModel
  @observable viewSeconds: number
  @observable yMin: number | 'auto'
  @observable yMax: number | 'auto'

  constructor(opts: LineChartModelOpts) {
    this.model = opts.model
    this.viewSeconds = 5
    this.yMin = 'auto'
    this.yMax = 'auto'
  }

  static of = memoize((model: ChartModel): LineChartModel => {
    return new LineChartModel({
      model,
    })
  })

  @computed
  get startTime() {
    return this.model.startTime
  }

  @computed
  get treeData() {
    return this.model.treeData
  }

  @computed
  get now() {
    return this.model.now
  }
}
