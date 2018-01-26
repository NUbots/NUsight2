import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx'

import { memoize } from '../../base/memoize'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'

export class VisionRadarModel {

  constructor(private appModel: AppModel) {
  }

  static of = memoize((appModel: AppModel): VisionRadarModel => {
    return new VisionRadarModel(appModel)
  })

  @computed
  get robots(): VisionRadarRobotModel[] {
    return this.appModel.robots.map(robot => VisionRadarRobotModel.of(robot))
  }
}

export class VisionRadarRobotModel {
  @observable.ref ringSegments: number[]
  @observable.ref colors: Array<[number, [number, number, number]]>

  constructor(private model: RobotModel, { ringSegments, colors }: {
    ringSegments: number[]
    colors: Array<[number, [number, number, number]]>
  }) {
    this.ringSegments = ringSegments
    this.colors = colors
  }

  static of = createTransformer((model: RobotModel): VisionRadarRobotModel => {
    return new VisionRadarRobotModel(model, {
      ringSegments: [],
      colors: [],
    })
  })

  @computed
  get id() {
    return this.model.id
  }
}
