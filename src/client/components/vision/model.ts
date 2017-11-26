import { computed } from 'mobx'
import { observable } from 'mobx'
import { IObservableValue } from 'mobx'
import { memoize } from '../../base/memoize'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'
import { Vector3 } from '../../math/vector3'

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
  image: IObservableValue<Uint8Array>
  Hcw: Matrix4
}

type VisionBall = {
  gradient: number
  axis: Vector3
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
  @observable.ref public image: IObservableValue<Uint8Array>
  @observable public Hcw: Matrix4

  constructor(private robotModel: RobotModel, opts: VisionRobotModelOpts) {
    this.balls = opts.balls
    this.goals = opts.goals
    this.image = opts.image
    this.Hcw = opts.Hcw
  }

  public static of = memoize((robotModel: RobotModel) => {
    return new VisionRobotModel(robotModel, {
      balls: [],
      goals: [],
      image: observable.box(),
      Hcw: Matrix4.of(),
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
