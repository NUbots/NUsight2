import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { BufferGeometry } from 'three'
import { PlaneBufferGeometry } from 'three'
import { RawShaderMaterial } from 'three'
import { MeshBasicMaterial } from 'three'
import { Float32BufferAttribute } from 'three'
import { WebGLRenderTarget } from 'three'
import { Scene } from 'three'
import { Material } from 'three'
import { Mesh } from 'three'
import { Vector2 } from 'three'
import { Camera } from 'three'
import { OrthographicCamera } from 'three'
import { DataTexture } from 'three'
import { LuminanceFormat } from 'three'
import { RGBFormat } from 'three'
import { Texture } from 'three'
import { UnsignedByteType } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { LinearFilter } from 'three'
import { NearestFilter } from 'three'
import { Vector4 } from 'three'
import { WebGLRenderer } from 'three'

import { ImageDecoder } from '../../../image_decoder/image_decoder'
import { ImageModel } from '../../../image_decoder/image_decoder'

import { CameraModel } from './model'
import { MeshModel } from './model'
import * as fragmentShader from './shaders/mesh.frag'
import * as vertexShader from './shaders/mesh.vert'

export class CameraViewModel {
  @observable.ref canvas: HTMLCanvasElement | null = null
  readonly camera: Camera

  constructor(
    private model: CameraModel,
    // We cache both the scene and the camera here as THREE.js uses these objects to store its own render lists.
    // So to conserve memory, it is best to keep them referentially identical across renders.
    private scene: Scene,
    camera: Camera,
  ) {
    this.camera = camera
  }

  static of = createTransformer((model: CameraModel) => {
    return new CameraViewModel(
      model,
      new Scene(),
      new OrthographicCamera(-1, 1, 1, -1, 0, 1),
    )
  })

  @computed
  get id(): number {
    return this.model.id
  }

  @computed
  get name(): string {
    return this.model.name
  }

  @computed
  private get decoder() {
    return ImageDecoder.of(this.renderer(this.canvas)!)
  }

  renderer = createTransformer((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      return new WebGLRenderer({ canvas })
    }
  }, renderer => renderer && renderer.dispose())

  getScene(): Scene {
    const scene = this.scene
    scene.remove(...scene.children)
    if (this.model.image) {
      scene.add(this.visualMesh(this.model.mesh))
    }
    return scene
  }

  private visualMesh = createTransformer((mesh: MeshModel): Mesh => {
    const material = this.meshMaterial
    material.uniforms.image.value = this.decoder.decode(this.model.image!)

    const obj = new Mesh(this.meshGeometry(mesh), this.meshMaterial)
    obj.frustumCulled = false
    return obj
  })

  @computed
  get meshMaterial(): RawShaderMaterial {
    return new RawShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
      uniforms: {
        image: { type: 't' },
      },
    })
  }

  private meshGeometry = createTransformer((mesh: MeshModel): BufferGeometry => {

    const { segments } = mesh

    const vertices: number[] = []
    const indices: number[] = []
    const colours: number[] = []
    const uvs: number[] = []

    // Create the vertices from the segments
    segments.forEach((n, i) => {
      const r = i / segments.length

      for (let s = 0; s < n; ++s) {
        const theta = s * (2 * Math.PI / n)
        vertices.push(Math.cos(theta) * r, Math.sin(theta) * r)
      }
    })

    // Create a cumulative buffer from our segments so we can index properly
    const cumulativeSegments = segments.reduce((acc, v, i) => {
      acc.push(segments[i] + acc[i])
      return acc
    }, [0])

    // Create the faces looping from the last ring inward
    for (let i = segments.length - 1; i > 0; --i) {
      const outer = segments[i]
      const outerOffset = cumulativeSegments[i]
      const inner = segments[i - 1]
      const innerOffset = cumulativeSegments[i - 1]

      // We care about finding 3 other verts to make 2 triangles:
      //  one around the ring to the right
      //  the next one below us
      //  the previous one below us
      for (let r = 0; r < outer; ++r) {
        // Work out the index of the point on the previous ring
        const innerPoint = inner * (r / outer)
        const inner1 = Math.floor(innerPoint)

        // Make the two triangles clockwise
        const p0 = r + outerOffset
        const p1 = ((r + 1) % outer) + outerOffset
        const p2 = inner1 + innerOffset
        const p3 = ((inner1 + 1) % inner) + innerOffset

        // Create our triangles
        indices.push(p0, p1, p3)
        indices.push(p2, p0, p3)
      }
    }

    // // Expand colours to match vertices
    // colours.length = (vertices.length / 2) * 3
    // colours.fill(0)
    // mesh.colors.forEach(v => {
    //   colours[v[0] * 3 + 0] = v[1][0]
    //   colours[v[0] * 3 + 1] = v[1][1]
    //   colours[v[0] * 3 + 2] = v[1][2]
    // })

    // Expand uvs to match vertices
    uvs.length = (vertices.length / 2) * 2
    uvs.fill(0)
    mesh.coordinates.forEach(v => {
      uvs[v[0] * 2 + 0] = v[1][0] / this.model.image!.width
      uvs[v[0] * 2 + 1] = v[1][1] / this.model.image!.height
    })

    const geometry = new BufferGeometry()
    geometry.setIndex(indices)
    geometry.addAttribute('position', new Float32BufferAttribute(vertices, 2))
    geometry.addAttribute('colour', new Float32BufferAttribute(colours, 3))
    geometry.addAttribute('uv', new Float32BufferAttribute(uvs, 2))

    return geometry
  }, (geometry?: BufferGeometry) => geometry && geometry.dispose())

}
