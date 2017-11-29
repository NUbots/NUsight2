import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class VisionRadarModel {

  constructor(private appModel: AppModel) {
  }

  public static of = memoize((appModel: AppModel): VisionRadarModel => {
    return new VisionRadarModel(appModel)
  })

  @computed
  get robots(): VisionRadarRobotModel[] {
    return this.appModel.robots.map(robot => VisionRadarRobotModel.of(robot))
  }
}

export class VisionRadarRobotModel {
  @observable public ringSegments: number[]

  constructor(private model: RobotModel, { ringSegments }: { ringSegments: number[] }) {
    this.ringSegments = ringSegments
  }

  public static of = createTransformer((model: RobotModel): VisionRadarRobotModel => {
    return new VisionRadarRobotModel(model, {
      ringSegments: [],
    })
  })

  @computed
  get id() {
    return this.model.id
  }
}
