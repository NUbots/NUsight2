import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { CameraViewModel } from './camera/view_model'
import { VisionModel } from './model'
import { VisionRobotModel } from './model'

export class VisionViewModel {
  constructor(private model: VisionModel) {}

  static of = createTransformer(
    (model: VisionModel): VisionViewModel => {
      return new VisionViewModel(model)
    },
  )

  @computed
  get robots(): RobotViewModel[] {
    return this.visibleRobots.map(RobotViewModel.of)
  }

  @computed
  private get visibleRobots(): VisionRobotModel[] {
    return this.model.robots.filter(robot => robot.visible && robot.cameras.size > 0)
  }
}

export class RobotViewModel {
  constructor(private model: VisionRobotModel) {}

  static of = createTransformer((model: VisionRobotModel) => {
    return new RobotViewModel(model)
  })

  @computed
  get id() {
    return this.model.id
  }

  @computed
  get name() {
    return this.model.name
  }

  @computed
  get cameras(): CameraViewModel[] {
    return Array.from(this.model.cameras.values(), CameraViewModel.of).sort((a, b) => a.id - b.id)
  }
}
