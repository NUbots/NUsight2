import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../canvas/appearance/basic_appearance'
import { CircleGeometry } from '../../canvas/geometry/circle_geometry'
import { Group } from '../../canvas/object/group'
import { Shape } from '../../canvas/object/shape'
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
      // this.cameraImageLayer,
    ]
  }

  @computed
  public get cameraImageLayer(): LayerViewModel {
    return {
      type: 'webgl',
      scene: [
        // TODO: image here
      ],
    }
  }

  @computed
  public get visionObjectsLayer(): LayerViewModel {
    return {
      type: '2d',
      scene: Group.of({
        children: [
          this.balls,
          // TODO: goals here
        ],
      }),
    }
  }

  @computed
  public get balls(): Group {
    return Group.of({
      children: this.robotModel.balls.map(ball => Shape.of(
        CircleGeometry.of({
          radius: ball.radius,
          x: ball.centre.x,
          y: ball.centre.y,
        }),
        BasicAppearance.of({
          fillStyle: 'orange',
        }),
      )),
    })
  }
}

type LayerViewModel = WebGLLayer | Canvas2DLayer

type WebGLLayer = {
  type: 'webgl'
  scene: any[] // TODO: type this
}

type Canvas2DLayer = {
  type: '2d'
  scene: Group
}
