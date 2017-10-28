import { computed } from 'mobx'
import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'
import { Vector2 } from '../../math/vector2'
import { observable } from 'mobx'

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
}

type VisionRobotModelOpts = {
  balls: VisionBall[]
  goals: VisionGoal[]
}

type VisionBall = {
  radius: number
  centre: Vector2
}

type VisionGoal = {
  tl: Vector2
  tr: Vector2
  bl: Vector2
  br: Vector2
}

export class VisionRobotModel {
  @observable public balls: VisionBall[]
  @observable public goals: VisionGoal[]

  constructor(private robotModel: RobotModel, opts: VisionRobotModelOpts) {
    this.balls = opts.balls
    this.goals = opts.goals
  }

  public static of = memoize((robotModel: RobotModel) => {
    return new VisionRobotModel(robotModel, {
      balls: [],
      goals: [],
    })
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
