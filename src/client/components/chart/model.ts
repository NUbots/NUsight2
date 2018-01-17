import { action } from 'mobx'
import { observable } from 'mobx'
import { computed } from 'mobx'

import { memoize } from '../../base/memoize'
import { Vector2 } from '../../math/vector2'
import { RobotModel } from '../robot/model'

import { LineChartModel } from './line_chart/model'

export class ChartModel {
  @observable private robotModels: RobotModel[]

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
  }

  static of = memoize((robots: RobotModel[]): ChartModel => {
    return new ChartModel(robots)
  })

  @computed
  get robots(): ChartRobotModel[] {
    return this.robotModels.map(robot => ChartRobotModel.of(robot))
  }

  @computed
  get lineChart(): LineChartModel {
    return LineChartModel.of(this)
  }
}

export class ChartRobotModel {
  @observable private robot: RobotModel
  @observable series: Map<string, SeriesModel[]>

  constructor(robot: RobotModel, series: Map<string, SeriesModel[]>) {
    this.robot = robot
    this.series = series
  }

  static of = memoize((robot: RobotModel): ChartRobotModel => {
    return new ChartRobotModel(robot, new Map())
  })

  @computed
  get visible(): boolean {
    return this.robot.enabled && this.robot.connected
  }
}

type Stack = {
  max: number[]
  min: number[]
}

type Stacks = {
  value: Stack
}

export class SeriesModel {
  @observable enabled: boolean
  @observable private points: Vector2[]
  // TODO Olejniczak use heap like structure instead of stacks
  @observable private stacks: Stacks

  constructor(enabled: boolean) {
    this.points = []
    this.stacks = {
      value: {
        max: [],
        min: [],
      },
    }
    this.enabled = enabled
  }

  static of(): SeriesModel {
    return new SeriesModel(true)
  }

  @computed
  get maxValue(): number {
    return this.stacks.value.max.length === 0 ? -Number.MAX_VALUE : this.stacks.value.max[0]
  }

  @computed
  get minValue(): number {
    return this.stacks.value.min.length === 0 ? Number.MAX_VALUE : this.stacks.value.min[0]
  }

  @computed
  get data(): Vector2[] {
    return this.points
  }

  @action
  append(point: Vector2): void {
    // TODO Olejniczak Ensure data points are inserted in correct order of timestamp
    if (this.points.length >= 3) {
      // TODO (Annable): find a real home for this, clean it up and comment it.
      const a = this.points[2]
      const b = this.points[1]
      const c = point
      const v1 = b.clone().subtract(a).normalize()
      const v2 = c.clone().subtract(a).normalize()
      const angle = Math.acos(v1.dot(v2))

      const allowedDegrees = 1
      if (angle < allowedDegrees / 180 * Math.PI) {
        this.points[0].copy(point)
        return
        // TODO: fix min/max D:?
      }
    }
    this.points.unshift(point)
    const value = point.y
    if (value > this.maxValue) {
      this.stacks.value.max.unshift(value)
    }
    if (value < this.minValue) {
      this.stacks.value.min.unshift(value)
    }
  }

  @action
  removeOlderThan(timestamp: number): void {
    for (const [index, point] of this.points.entries()) {
      if (point.x < timestamp) {
        this.points.splice(index, this.points.length - index)
        break
      }
    }
  }
}

