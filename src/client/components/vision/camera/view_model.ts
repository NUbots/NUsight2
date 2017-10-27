import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Scene } from 'three'
import { MeshBasicMaterial } from 'three'
import { BoxGeometry } from 'three'
import { Mesh } from 'three'
import { WebGLRenderer } from 'three'
import { Camera } from 'three'
import { OrthographicCamera } from 'three'
import { memoize } from '../../../base/memoize'
import { VisionRobotModel } from '../model'

export class CameraViewModel {
  public renderer = memoize((canvas: HTMLCanvasElement) => {
    return new WebGLRenderer({ canvas })
  })

  public constructor(private robotModel: VisionRobotModel) {
  }

  public static of = createTransformer((robotModel: VisionRobotModel) => {
    return new CameraViewModel(robotModel)
  })

  @computed
  public get camera(): Camera {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.position.z = 1
    return camera
  }

  @computed
  public get scene(): Scene {
    const scene = new Scene()
    scene.add(this.box)
    return scene
  }

  @computed
  private get box(): Mesh {
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 'green' })
    return new Mesh(geometry, material)
  }
}
