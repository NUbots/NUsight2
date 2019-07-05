import * as bounds from 'binary-search-bounds'
import { observable } from 'mobx'
import { computed } from 'mobx'
import { autorun } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Object3D, Vector3 } from 'three'
import { RawShaderMaterial } from 'three'
import { Vector2 } from 'three'
import { Scene } from 'three'
import { WebGLRenderer } from 'three'
import { Mesh } from 'three'
import { BufferGeometry } from 'three'
import { Camera } from 'three'
import { OrthographicCamera } from 'three'
import { Float32BufferAttribute } from 'three'

import { ImageDecoder } from '../../../image_decoder/image_decoder'
import { Matrix4 as Matrix4Model } from '../../../math/matrix4'
import { Vector3 as Vector3Model } from '../../../math/vector3'

import { CameraModel } from './model'
import { VisualMesh } from './model'
import meshFragmentShader from './shaders/mesh.frag'
import meshVertexShader from './shaders/mesh.vert'

export class CameraViewModel {

  @observable.ref canvas: HTMLCanvasElement | null = null

  readonly camera: Camera
  readonly destroy: () => void

  constructor(
    private model: CameraModel,
    // We cache both the scene and the camera here as THREE.js uses these objects to store its own render lists.
    // So to conserve memory, it is best to keep them referentially identical across renders.
    private scene: Scene,
    camera: Camera,
  ) {
    this.camera = camera

    // Setup an autorun that will feed images to our image decoder when they change
    this.destroy = autorun(() => {
      this.canvas && this.decoder.update(this.model.image!)
    })
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
      return new WebGLRenderer({ canvas, alpha: true })
    }
  }, renderer => renderer && renderer.dispose())

  getScene(): Scene {
    const scene = this.scene
    scene.remove(...scene.children)
    if (this.model.mesh && this.model.image) {
      scene.add(this.visualMesh(this.model.mesh))
    }
    return scene
  }

  private visualMesh = createTransformer((mesh: VisualMesh): Object3D => {
    const meshMaterial = this.meshMaterial
    const { centre, focalLength, projection } = this.model.image!.lens
    meshMaterial.uniforms = {
      image: { value: this.decoder.texture },
      dimensions: { value: new Vector2(this.model.image!.width, this.model.image!.height) },
      Hcw: { value: this.model.image ? toThreeMatrix4(this.model.image.Hcw) : new Matrix4() },
      focalLength: { value: focalLength },
      centre: { value: new Vector2(centre.x, centre.y) },
      projection: { value: projection },
      k: { value: mesh.k },
      r: { value: mesh.r },
      h: { value: mesh.h },
    }

    // The UV mapped mesh
    const m = new Mesh(this.meshGeometry(mesh), meshMaterial)
    m.frustumCulled = false

    const obj = new Object3D()
    obj.add(m)
    return obj
  })

  @computed
  get meshMaterial(): RawShaderMaterial {
    return new RawShaderMaterial({
      vertexShader: meshVertexShader,
      fragmentShader: meshFragmentShader,
    })
  }

  private meshGeometry = createTransformer((mesh: VisualMesh): BufferGeometry => {

    const { neighbours, rays, classifications } = mesh

    // Calculate our triangle indexes
    const nElem = rays.length / 3
    const triangles = []
    for (let i = 0; i < nElem; i++) {
      const ni = i * 6
      if (neighbours[ni + 0] < nElem) {
        if (neighbours[ni + 2] < nElem) {
          triangles.push(i, neighbours[ni + 0], neighbours[ni + 2])
        }
        if (neighbours[ni + 1] < nElem) {
          triangles.push(i, neighbours[ni + 1], neighbours[ni + 0])
        }
      }
    }

    const geometry = new BufferGeometry()
    geometry.setIndex(triangles)
    geometry.addAttribute('position', new Float32BufferAttribute(rays, 3))

    // TODO need Hcw and lens parameters

    // Read each class into a separate attribute
    const buffer = new InterleavedBuffer(
      new Float32Array(classifications.values.slice(0, -classifications.dim)),
      classifications.dim,
    )

    // Add our classification objects
    geometry.addAttribute(`ball`, new InterleavedBufferAttribute(buffer, 1, 0))
    geometry.addAttribute(`goal`, new InterleavedBufferAttribute(buffer, 1, 1))
    geometry.addAttribute(`fieldLine`, new InterleavedBufferAttribute(buffer, 1, 2))
    geometry.addAttribute(`field`, new InterleavedBufferAttribute(buffer, 1, 3))
    geometry.addAttribute(`environment`, new InterleavedBufferAttribute(buffer, 1, 4))

    return geometry
  }, (geometry?: BufferGeometry) => geometry && geometry.dispose())

}

function toThreeMatrix4(mat4: Matrix4Model): Matrix4 {
  return new Matrix4().set(
    mat4.x.x, mat4.x.y, mat4.x.z, mat4.x.t,
    mat4.y.x, mat4.y.y, mat4.y.z, mat4.y.t,
    mat4.z.x, mat4.z.y, mat4.z.z, mat4.z.t,
    mat4.t.x, mat4.t.y, mat4.t.z, mat4.t.t,
  )
}

function toThreeVector3(vec3: Vector3Model): Vector3 {
  return new Vector3(vec3.x, vec3.y, vec3.z)
}
