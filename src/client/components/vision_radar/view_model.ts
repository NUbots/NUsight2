///<reference path="../../../../node_modules/@types/three/three-core.d.ts"/>
import { observable } from 'mobx'
import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { PlaneBufferGeometry } from 'three'
import { WebGLRenderTarget } from 'three'
import { LinearFilter } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { UnsignedByteType } from 'three'
import { LuminanceFormat } from 'three'
import { DataTexture } from 'three'
import { Texture } from 'three'
import { WebGLRenderer } from 'three'
import { Scene } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { Mesh } from 'three'
import { Material } from 'three'
import { BufferGeometry } from 'three'
import { Float32BufferAttribute } from 'three'
import { RawShaderMaterial } from 'three'
import { VisionRadarModel } from './model'
import { VisionRadarRobotModel } from './model'
import * as fragmentShader from './shaders/radar.frag'
import * as vertexShader from './shaders/radar.vert'
import * as imageFragmentShader from '../vision/camera/shaders/image.frag'
import * as imageVertexShader from '../vision/camera/shaders/image.vert'

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
  @observable.ref public canvas: HTMLCanvasElement | null = null

  constructor(private model: VisionRadarRobotModel) {
  }

  public static of = createTransformer((model: VisionRadarRobotModel): VisionRadarRobotViewModel => {
    return new VisionRadarRobotViewModel(model)
  })

  @computed
  get renderer(): WebGLRenderer | undefined {
    if (this.canvas) {
      return new WebGLRenderer({ canvas: this.canvas })
    }
  }

  @computed
  get id() {
    return this.model.id
  }

  @computed
  get scene(): Scene {
    const scene = new Scene()
    if (this.model.image) {
      scene.add(this.radar)
    }
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
    const uvs: number[] = []

    // Create the vertices from the segments
    this.model.ringSegments.forEach((segments, i) => {
      const r = i / this.model.ringSegments.length

      for (let s = 0; s < segments; ++s) {
        const theta = s * (2 * Math.PI / segments)
        vertices.push(Math.cos(theta) * r, Math.sin(theta) * r)
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
        let innerPoint = inner * (r / outer)
        let inner1 = Math.floor(innerPoint)

        // Make the two triangles clockwise
        let p0 = r + outerOffset
        let p1 = ((r + 1) % outer) + outerOffset
        let p2 = inner1 + innerOffset
        let p3 = ((inner1 + 1) % inner) + innerOffset

        // Create our triangles
        indices.push(p0, p1, p3)
        indices.push(p2, p0, p3)
      }
    }

    // Expand colours to match vertices
    colours.length = (vertices.length / 2) * 3
    colours.fill(0)
    this.model.colors.forEach(v => {
      colours[v[0] * 3 + 0] = v[1][0]
      colours[v[0] * 3 + 1] = v[1][1]
      colours[v[0] * 3 + 2] = v[1][2]
    })

    // Expand uvs to match vertices
    uvs.length = (vertices.length / 2) * 2
    uvs.fill(0)
    this.model.coordinates.forEach(v => {
      uvs[v[0] * 2 + 0] = v[1][0] / this.model.image!.width
      uvs[v[0] * 2 + 1] = 1 - (v[1][1] / this.model.image!.height) // flip y
    })

    const geometry = new BufferGeometry()
    geometry.setIndex(indices)
    geometry.addAttribute('position', new Float32BufferAttribute(vertices, 2))
    geometry.addAttribute('colour', new Float32BufferAttribute(colours, 3))
    geometry.addAttribute('uv', new Float32BufferAttribute(uvs, 2))

    return geometry
  }

  @computed
  get radarMaterial(): Material {
    return new RawShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
      uniforms: {
        image: { value: this.imageTexture },
      },
    })
  }

  @computed
  private get imageTexture2(): Texture {
    const texture = new DataTexture(
      this.model.image!.data,
      this.model.image!.width,
      this.model.image!.height,
      LuminanceFormat,
      UnsignedByteType,
      Texture.DEFAULT_MAPPING,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      LinearFilter,
      LinearFilter,
    )
    texture.flipY = true
    texture.needsUpdate = true
    return texture
  }

  @computed
  private get imageTexture(): Texture {
    // TODO: width/height
    const { width, height } = this.model.image!
    const renderTarget = new WebGLRenderTarget(width, height)
    renderTarget.depthBuffer = false
    renderTarget.stencilBuffer = false
    const scene = new Scene()
    const material = new RawShaderMaterial({
      vertexShader: String(imageVertexShader),
      fragmentShader: String(imageFragmentShader),
      uniforms: {
        // TODO: width/height
        sourceSize: { value: [width, height, 1 / width, 1 / height] },
        firstRed: { value: [1, 0] },
        image: { value: this.imageTexture2, type: 't' },
      },
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new Mesh(this.quadGeometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3)
    camera.position.z = 2
    this.renderer!.render(scene, camera, renderTarget)
    return renderTarget.texture
  }

  @computed
  private get quadGeometry(): BufferGeometry {
    return new PlaneBufferGeometry(2, 2)
  }
}
