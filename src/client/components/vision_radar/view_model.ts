import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { WebGLRenderer } from 'three'
import { Renderer } from 'three'
import { Scene } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { Mesh } from 'three'
import { Material } from 'three'
import { BufferGeometry } from 'three'
import { Float32BufferAttribute } from 'three'
import { Uint8BufferAttribute } from 'three'
import { RawShaderMaterial } from 'three'
import { Vector2 } from 'three'
import { VisionRadarModel } from './model'
import { VisionRadarRobotModel } from './model'
import * as fragmentShader from './shaders/radar.frag'
import * as vertexShader from './shaders/radar.vert'

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
    const mesh = new Mesh(this.radarGeometry, this.radarMaterial)
    mesh.frustumCulled = false
    return mesh
  }

  @computed
  get radarGeometry(): BufferGeometry {

    const vertices: number[] = []
    const indices: number[] = []
    const colours: number[] = []

    // Create the vertices from the segments
    this.model.ringSegments.forEach((segments, i) => {
      for(let s = 0; s < segments; ++s) {
        const theta = s * (2 * Math.PI / segments)
        vertices.push(Math.cos(theta) * (i / this.model.ringSegments.length), Math.sin(theta) * (i / this.model.ringSegments.length))
      }
    })

    // Create a cumulative buffer from our segments so we can index properly
    const cumulativeSegments = []
    let cSum = 0
    for (let i = 0; i < this.model.ringSegments.length; ++i) {
      cumulativeSegments.push(cSum)
      cSum += this.model.ringSegments[i]
    }

    // Create the faces looping from the last ring inward
    for (let i = this.model.ringSegments.length - 1; i > 0; --i) {
      const outer = this.model.ringSegments[i]
      const outerOffset = cumulativeSegments[i]
      const inner = this.model.ringSegments[i - 1]
      const innerOffset = cumulativeSegments[i - 1]

      // We care about finding 3 other verts to make 2 triangles:
      //  one around the ring to the right
      //  the next one below us
      //  the previous one below us
      for (let r = 0; r < outer; ++r) {
        // Work out the index of the point on the previous ring
        let innerPoint =  inner * (r / outer)
        let inner1 = Math.floor(innerPoint)

        // Make the two triangles clockwise
        let p0 = r + outerOffset
        let p1 = ((r + 1) % outer) + outerOffset
        let p2 = inner1 + innerOffset
        let p3 = ((inner1 + 1) % inner) + innerOffset

        // Create our triangles
        indices.push(p0, p1, p3)
        indices.push(p0, p2, p3)
      }
    }

    // Expand colours to match vertices
    colours.length = (vertices.length / 2) * 3
    colours.fill(0)
    for (const key of Object.keys(this.model.colors)) {
      colours[parseInt(key) * 3 + 0] = this.model.colors[key][0]
      colours[parseInt(key) * 3 + 1] = this.model.colors[key][1]
      colours[parseInt(key) * 3 + 2] = this.model.colors[key][2]
    }

    const geometry = new BufferGeometry()
    geometry.setIndex(indices)
    geometry.addAttribute('position', new Float32BufferAttribute(vertices, 2))
    geometry.addAttribute('colour', new Uint8BufferAttribute(colours, 3))

    return geometry
  }

  @computed
  get radarMaterial(): Material {
    return new RawShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
    })
  }
}
