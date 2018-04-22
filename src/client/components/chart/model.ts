import { observable } from 'mobx'
import { computed } from 'mobx'
import { now } from 'mobx-utils'

import { Vector2 } from '../../math/vector2'
import { BrowserSystemClock } from '../../time/browser_clock'
import { CheckedState } from '../checkbox_tree/model'
import { RobotModel } from '../robot/model'
import { TreeViewModel } from './view_model'

export interface TreeData extends Map<string, TreeData | DataSeries> {
}

export class DataSeries {
  @observable highlight: boolean = false
  @observable color: string
  @observable timeDelta: number
  @observable timeVariance: number
  @observable checked: CheckedState
  @observable series: Vector2[]

  private kf = {
    processNoise: 1e-3,
    measurementNoise: 1e-1,
  }

  constructor({ color = '#ffffff', checked = CheckedState.Unchecked }: Partial<DataSeries> = {}) {
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

type ChartModelOpts = {
  robotModels: RobotModel[]
}

export class ChartModel {
  @observable private robotModels: RobotModel[]

  @observable treeData: TreeData
  @observable startTime: number
  @observable bufferSeconds: number

  constructor({ robotModels, treeData, startTime, bufferSeconds }: {
    robotModels: RobotModel[]
    treeData: Map<string, TreeData | DataSeries>
    startTime: number
    bufferSeconds: number
  }) {
    this.robotModels = robotModels
    this.treeData = treeData
    this.startTime = startTime
    this.bufferSeconds = bufferSeconds
  }

  static of({ robotModels }: ChartModelOpts) {
    return new ChartModel({
      robotModels,
      treeData: new Map(),
      // The exact value of this number isn't important, it's simply here to make the time numbers smaller
      startTime: BrowserSystemClock.now(),
      bufferSeconds: 10,
    })
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

  @computed
  get now() {
    return (now('frame') / 1000) - this.startTime
  }
}
