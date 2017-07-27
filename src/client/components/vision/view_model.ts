import { createTransformer } from 'mobx'
import { computed } from 'mobx'
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
  public get name() {
    return this.robotModel.name
  }

  @computed
  public get layers(): LayerViewModel[] {
    // Layers should be ordered from top-to-bottom.
    return [
      this.visionObjectsLayer,
      this.cameraImageLayer,
    ]
  }

  @computed
  public get cameraImageLayer(): LayerViewModel {
    return {
      type: 'webgl',
      children: [
        // TODO: image here
      ],
    }
  }

  @computed
  public get visionObjectsLayer(): LayerViewModel {
    return {
      type: '2d',
      children: [
        // TODO: balls here
        // TODO: goals here
      ],
    }
  }
}

type LayerViewModel = WebGLLayer | Canvas2DLayer

type WebGLLayer = {
  type: 'webgl'
  children: any[] // TODO: type this
}

type Canvas2DLayer = {
  type: '2d'
  children: any[] // TODO: type this
}
