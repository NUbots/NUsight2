import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { WebGLRenderer } from 'three'
import { Renderer } from 'three'
import { Scene } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { VisionRadarModel } from './model'
import { VisionRadarRobotModel } from './model'
import { Object3D } from 'three'
import { Mesh } from 'three'
import { ShaderMaterial } from 'three'
import { Material } from 'three'
import { Geometry } from 'three'
import { CircleGeometry } from 'three'
import { MeshBasicMaterial } from 'three'

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
  public renderer = createTransformer((canvas: HTMLCanvasElement): Renderer => {
    return new WebGLRenderer({ canvas })
  })
  
  constructor(private model: VisionRadarRobotModel) {
  }

  public static of = createTransformer((model: VisionRadarRobotModel): VisionRadarRobotViewModel => {
    return new VisionRadarRobotViewModel(model)
  })

  @computed
  get scene(): Scene {
    const scene = new Scene()
    scene.add(this.radar)
    return scene
  }

  @computed
  get camera(): Camera {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3)
    camera.position.z = 2
    return camera
  }

  @computed
  get radar(): Mesh {
    return new Mesh(this.radarGeometry, this.radarMaterial)
  }

  @computed
  get radarGeometry(): Geometry {
    return new CircleGeometry(1, 50)
  }

  @computed
  get radarMaterial(): Material {
    return new MeshBasicMaterial({ color: 'red' })
  }
}
