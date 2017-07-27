import { computed } from 'mobx'
import { observable } from 'mobx'
import { memoize } from '../../base/memoize'
import { RobotModel } from '../robot/model'

export type DataPointModel = {
  timestamp: number
  value: number[]
}

export type SeriesModel = {
  points: DataPointModel[]
}

export class ChartModel {
  @observable private robotModels: RobotModel[]

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
  }

  public static of = memoize((robots: RobotModel[]): ChartModel => {
    return new ChartModel(robots)
  })

  @computed get robots(): ChartRobotModel[] {
    return this.robotModels.map(robot => ChartRobotModel.of(robot))
  }
}

export class ChartRobotModel {
  @observable public robot: RobotModel
  @observable public series: Map<string, SeriesModel>

  constructor(robot: RobotModel, series: Map<string, SeriesModel>) {
    this.robot = robot
    this.series = series
  }

  public static of = memoize((robot: RobotModel): ChartRobotModel => {
    return new ChartRobotModel(robot, new Map())
  })
}
