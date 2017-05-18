import { observable } from 'mobx'
import { TimeSeries } from 'smoothie'

export class ChartDataModel {
  @observable public enabled: boolean
  @observable public series: TimeSeries
  @observable public colour: string

  private constructor(opts: ChartDataModel) {
    Object.assign(this, opts)
  }

  public static of(): ChartDataModel {
    return new ChartDataModel({
      enabled: false,
      series: new TimeSeries(),
      colour: '#FFFFFF',
    })
  }
}

export class ChartTreeModel {
  @observable public label: string
  @observable public children: Array<ChartTreeModel | ChartDataModel>

  private constructor(opts: ChartTreeModel) {
    Object.assign(this, opts)
  }

  public static of(l: string): ChartTreeModel {
    return new ChartTreeModel({
      label: l,
      children: [],
    })
  }
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
