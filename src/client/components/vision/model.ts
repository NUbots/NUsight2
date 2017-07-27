import { computed } from 'mobx'
import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class VisionModel {
  public constructor(private appModel: AppModel) {
  }

  public static of = memoize((appModel: AppModel) => {
    return new VisionModel(appModel)
  })

  @computed
  public get robots(): VisionRobotModel[] {
    return this.appModel.robots.map(robot => VisionRobotModel.of(robot))
  }

  @computed
  public get visibleRobots() {
    return this.robots.filter(robot => robot.visible)
  }
}

export class VisionRobotModel {
  constructor(private robotModel: RobotModel) {
  }

  public static of = memoize((robotModel: RobotModel) => {
    return new VisionRobotModel(robotModel)
  })

  @computed
  public get name() {
    return this.robotModel.name
  }

  @computed
  public get visible() {
    return this.robotModel.enabled
  }
}
