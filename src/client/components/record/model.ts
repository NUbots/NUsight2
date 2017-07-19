import { observable } from 'mobx'
import { computed } from 'mobx'
import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class RecordModel {
  @observable private appModel: AppModel

  public constructor(appModel: AppModel) {
    this.appModel = appModel
  }

  public static of(appModel: AppModel) {
    return new RecordModel(appModel)
  }

  @computed
  public get robots(): RecordRobotModel[] {
    return this.appModel.robots.map(robot => RecordRobotModel.of(robot))
  }
}

type RecordRobotModelOpts = {
  recording: boolean
}

export class RecordRobotModel {
  @observable private robotModel: RobotModel
  @observable public recording: boolean
  public stopRecording?: () => void

  public constructor(robotModel: RobotModel, opts: RecordRobotModelOpts) {
    this.robotModel = robotModel
    this.recording = opts.recording
  }

  public static of = memoize((robot: RobotModel): RecordRobotModel => {
    return new RecordRobotModel(robot, {
      recording: false // TODO (Annable): get from server?
    })
  })

  @computed
  public get name(): string {
    return this.robotModel.name
  }

  @computed
  public get address(): string {
    return this.robotModel.address
  }

  @computed
  public get port(): number {
    return this.robotModel.port
  }
}
