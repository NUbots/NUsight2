import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { WebGLRenderer } from 'three'
import { Renderer } from 'three'
import { Scene } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { VisionRadarModel } from './model'
import { VisionRadarRobotModel } from './model'

export class VisionRadarViewModel {
  constructor(private model: VisionRadarModel) {
  }

  public static of = createTransformer((model: VisionRadarModel): VisionRadarViewModel => {
    return new VisionRadarViewModel(model)
  })

  @computed
  get robots() {
    return this.model.robots.map(robot => VisionRadarRobotViewModel.of(robot))
  }
}

export class VisionRadarRobotViewModel {
  constructor(private model: VisionRadarRobotModel) {
  }

  public static of = createTransformer((model: VisionRadarRobotModel): VisionRadarRobotViewModel => {
    return new VisionRadarRobotViewModel(model)
  })

  public renderer = createTransformer((canvas: HTMLCanvasElement): Renderer => {
    return new WebGLRenderer({ canvas })
  })

  @computed
  get scene(): Scene {
    return new Scene()
  }

  @computed
  get camera(): Camera {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3)
    camera.position.z = 2
    return camera
  }
}
