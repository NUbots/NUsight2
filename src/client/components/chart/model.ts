import { action } from 'mobx'
import { observable } from 'mobx'
import { computed } from 'mobx'

import { memoize } from '../../base/memoize'
import { Vector2 } from '../../math/vector2'
import { CheckedState } from '../checkbox_tree/model'
import { RobotModel } from '../robot/model'

import { TreeViewModel } from './view_model'

export interface TreeData extends Map<string, TreeData | TreeDataSeries> {}

export type TreeDataPoint = {
  timestamp: number
  value: number
}

export class TreeDataSeries {
  @observable color: string
  @observable checked: CheckedState
  @observable series: TreeDataPoint[]

  constructor({ color = '#ff0000', checked = CheckedState.Unchecked }: Partial<TreeDataSeries> = {}) {
    this.color = color
    this.checked = checked
    this.series = []
  }
}

export class ChartModel {
  @observable private robotModels: RobotModel[]
  @observable treeData: TreeData = new Map<string, TreeData | TreeDataSeries>()

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
  }

  @computed
  get tree() {
    return {
      nodes: Array.from(this.treeData.entries()).map((entry: [string, TreeData | TreeDataSeries]) => TreeViewModel.of({
        label: entry[0],
        model: entry[1],
      })),
      usePessimisticToggle: true,
    }
  }
}
