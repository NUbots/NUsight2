import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { WebGLRenderer } from 'three'
import { Renderer } from 'three'
import { Scene } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { Mesh } from 'three'
import { Material } from 'three'
import { MeshBasicMaterial } from 'three'
import { Vector3 } from 'three'
import { BufferGeometry } from 'three'
import { Float32BufferAttribute } from 'three'
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
  get radarGeometry(): BufferGeometry {
    const geometry = new BufferGeometry()
    const indices = []
    const vertices = []
    const vertex = new Vector3()
    vertices.push(0, 0, 0)
    const numSegments = 50
    for (let i = 0; i <= numSegments; i++) {
      const theta = i * 2 * Math.PI / numSegments
      vertex.x = Math.cos(theta)
      vertex.y = Math.sin(theta)
      vertices.push(vertex.x, vertex.y, vertex.z)
    }
    for (let i = 1; i <= numSegments; i++) {
      indices.push(i, i + 1, 0)
    }
    geometry.setIndex(indices)
    geometry.addAttribute('position', new Float32BufferAttribute(vertices, 3))
    return geometry
  }

  @computed
  get radarMaterial(): Material {
    return new MeshBasicMaterial({ color: 'red' })
  }
}
