import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { CameraViewModel } from './camera/view_model'
import { VisionModel } from './model'
import { VisionRobotModel } from './model'

export class VisionViewModel {
  public constructor(private model: VisionModel) {
  }

  public static of = createTransformer((model: VisionModel): VisionViewModel => {
    return new VisionViewModel(model)
  })

  @computed
  public get robots(): RobotViewModel[] {
    return this.visibleRobots.map(robot => RobotViewModel.of(robot))
  }

  @computed
  private get visibleRobots(): VisionRobotModel[] {
    return this.model.robots.filter(robot => robot.visible)
  }
}

export class RobotViewModel {
  public constructor(private robotModel: VisionRobotModel) {
  }

  public static of = createTransformer((robotModel: VisionRobotModel) => {
    return new RobotViewModel(robotModel)
  })

  @computed
  public get id() {
    return this.robotModel.id
  }

  @computed
  public get name() {
    return this.robotModel.name
  }

  @computed
  get cameraViewModel(): CameraViewModel {
    return CameraViewModel.of(this.robotModel)
  }
}
