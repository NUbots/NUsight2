import { action } from 'mobx'
import { observable } from 'mobx'
import { computed } from 'mobx'

import { memoize } from '../../base/memoize'
import { Vector2 } from '../../math/vector2'
import { CheckedState } from '../checkbox_tree/model'
import { RobotModel } from '../robot/model'

import { TreeViewModel } from './view_model'

export interface TreeData extends Map<string, TreeData | DataSeries> {}

export class DataSeries {
  @observable color: string
  @observable timeDelta: number
  @observable timeVariance: number
  @observable checked: CheckedState
  @observable series: Vector2[]

  private kf = {
    processNoise: 1e-3,
    measurementNoise: 1e-1,
  }

  constructor({ color = '#ff0000', checked = CheckedState.Unchecked }: Partial<DataSeries> = {}) {
    this.color = color
    this.checked = checked
    this.series = []
    this.timeDelta = 0
    this.timeVariance = 1
  }

  updateDelta(delta: number) {
    const Q = this.kf.processNoise
    const R = this.kf.measurementNoise

    // Calculate kalman gain
    const K = (this.timeVariance + Q) / (this.timeVariance + Q + R)

    // Do the filter
    this.timeVariance = R * (this.timeVariance + Q) / (R + this.timeVariance + Q)
    this.timeDelta = this.timeDelta + (delta - this.timeDelta) * K
  }
}

export class ChartModel {
  @observable private robotModels: RobotModel[]
  @observable treeData: TreeData = new Map<string, TreeData | DataSeries>()
  // The exact value of this number isn't important, it's simply here to make the time numbers smaller
  @observable startTime: number = Date.now() / 1000
  @observable bufferSeconds: number = 10

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
  }

  @computed
  get tree() {
    return {
      nodes: Array.from(this.treeData.entries()).map((entry: [string, TreeData | DataSeries]) => TreeViewModel.of({
        label: entry[0],
        model: entry[1],
      })),
      usePessimisticToggle: true,
    }
  }
}
