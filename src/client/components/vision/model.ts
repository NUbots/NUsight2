import { computed } from 'mobx'
import { observable } from 'mobx'
import { IObservableValue } from 'mobx'

import { memoize } from '../../base/memoize'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'
import { Vector3 } from '../../math/vector3'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class VisionModel {
  constructor(private appModel: AppModel) {
  }

  static of = memoize((appModel: AppModel) => {
    return new VisionModel(appModel)
  })

  @computed
  get robots(): VisionRobotModel[] {
    return this.appModel.robots.map(robot => VisionRobotModel.of(robot))
  }
}

type VisionRobotModelOpts = {
  balls: VisionBallModel[]
  goals: VisionGoal[]
  image?: VisionImage
  Hcw: Matrix4
}

type VisionGoal = {
  tl: Vector2
  tr: Vector2
  bl: Vector2
  br: Vector2
}

type VisionImage = {
  format: number,
  width: number,
  height: number,
  data: Uint8Array
}

export class VisionRobotModel {
  @observable balls: VisionBallModel[]
  @observable goals: VisionGoal[]
  @observable.shallow image?: VisionImage
  @observable Hcw: Matrix4

  constructor(private robotModel: RobotModel, opts: VisionRobotModelOpts) {
    this.balls = opts.balls
    this.goals = opts.goals
    this.image = opts.image
    this.Hcw = opts.Hcw
  }

  static of = memoize((robotModel: RobotModel) => {
    return new VisionRobotModel(robotModel, {
      balls: [],
      goals: [],
      Hcw: Matrix4.of(),
    })
  })

  @computed
  get id() {
    return this.robotModel.id
  }

  @computed
  get name() {
    return this.robotModel.name
  }

  @computed
  get visible() {
    return this.robotModel.enabled
  }
}

export class VisionBallModel {
  @observable gradient: number
  @observable axis: Vector3

  constructor(private model: VisionRobotModel, { gradient, axis }: { gradient: number, axis: Vector3 }) {
    this.gradient = gradient
    this.axis = axis
  }

  static of = memoize((robotModel: VisionRobotModel) => {
    return new VisionBallModel(robotModel, {
      gradient: 0,
      axis: Vector3.of(),
    })
  })

  @computed
  get Hcw(): Matrix4 {
    return this.model.Hcw
  }
}
