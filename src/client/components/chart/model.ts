import { computed, action } from 'mobx'
import { observable } from 'mobx'
import { memoize } from '../../base/memoize'
import { RobotModel } from '../robot/model'
import { LineChartModel } from './line_chart/model'

export class ChartModel {
  @observable private robotModels: RobotModel[]

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
  }

  public static of = memoize((robots: RobotModel[]): ChartModel => {
    return new ChartModel(robots)
  })

  @computed public get robots(): ChartRobotModel[] {
    return this.robotModels.map(robot => ChartRobotModel.of(robot))
  }

  @computed public get lineChart(): LineChartModel {
    return LineChartModel.of(this.robots)
  }
}

export class ChartRobotModel {
  @observable private robot: RobotModel
  @observable public series: Map<string, SeriesModel[]>

  constructor(robot: RobotModel, series: Map<string, SeriesModel[]>) {
    this.robot = robot
    this.series = series
  }

  public static of = memoize((robot: RobotModel): ChartRobotModel => {
    return new ChartRobotModel(robot, new Map())
  })

  @computed public get visible(): boolean {
    return this.robot.enabled && this.robot.connected
  }
}

export type DataPointModel = {
  timestamp: number
  value: number
}

type Stack = {
  max: number[]
  min: number[]
}

type Stacks = {
  value: Stack
}

export class SeriesModel {
  @observable public enabled: boolean
  @observable private points: DataPointModel[]
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

  public static of(): SeriesModel {
    return new SeriesModel(true)
  }

  @computed public get maxValue(): number {
    return this.stacks.value.max.length === 0 ? -Number.MAX_VALUE : this.stacks.value.max[0]
  }

  @computed public get minValue(): number {
    return this.stacks.value.min.length === 0 ? Number.MAX_VALUE : this.stacks.value.min[0]
  }

  @computed public get data(): DataPointModel[] {
    return this.points
  }

  @action
  public append(point: DataPointModel): void {
    this.points.push(point)
    const value = point.value
    if (value > this.maxValue) {
      this.stacks.value.max.unshift(value)
    }
    if (value < this.minValue) {
      this.stacks.value.min.unshift(value)
    }
  }
}

