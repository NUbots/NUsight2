import { observable } from 'mobx'
import { TimeSeries } from 'smoothie'

export interface ChartDataModel {
  enabled: boolean
  series: TimeSeries
  colour: string
}

export interface ChartTreeModel {
  label: string
  children: Array<ChartTreeModel | ChartDataModel>
}

export class ChartModel {
  @observable public tree: ChartTreeModel[]

  private constructor(opts: ChartModel) {
    Object.assign(this, opts)
  }

  public static of(): ChartModel {
    return new ChartModel({
      tree: [],
    })
  }
}
