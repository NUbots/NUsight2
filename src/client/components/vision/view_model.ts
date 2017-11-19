import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Scene } from 'three'
import { WebGLRenderer } from 'three'
import { Camera } from 'three'
import { Group } from '../../canvas/object/group'
import { CanvasRenderer } from '../../canvas/renderer'
import { Transform } from '../../math/transform'
import { CameraViewModel } from './camera/view_model'
import { VisionModel } from './model'
import { VisionRobotModel } from './model'
import { VisionObjectsViewModel } from './vision_objects/view_model'

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
      // this.visionObjectsLayer,
      this.cameraImageLayer,
    ]
  }

  @computed
  public get cameraImageLayer(): LayerViewModel {
    const cameraViewModel = this.cameraViewModel
    return {
      type: 'webgl',
      scene: cameraViewModel.scene,
      camera: cameraViewModel.camera,
      renderer: cameraViewModel.renderer,
    }
  }

  @computed
  public get visionObjectsLayer(): LayerViewModel {
    const visionObjectsViewModel = this.visionObjectsViewModel
    return {
      type: 'canvas2d',
      scene: visionObjectsViewModel.scene,
      camera: visionObjectsViewModel.camera,
      renderer: visionObjectsViewModel.renderer,
    }
  }

  @computed
  private get cameraViewModel(): CameraViewModel {
    return CameraViewModel.of(this.robotModel)
  }

  @computed
  private get visionObjectsViewModel(): VisionObjectsViewModel {
    return VisionObjectsViewModel.of(this.robotModel)
  }
}

type LayerViewModel = WebGLLayer | Canvas2DLayer

type WebGLLayer = {
  type: 'webgl'
  scene: Scene,
  camera: Camera,
  renderer(canvas: HTMLCanvasElement): WebGLRenderer
}

type Canvas2DLayer = {
  type: 'canvas2d'
  scene: Group,
  camera: Transform,
  renderer(canvas: HTMLCanvasElement): CanvasRenderer
}
