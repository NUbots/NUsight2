import * as bounds from 'binary-search-bounds'
import { autorun } from 'mobx'
import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Object3D } from 'three'
import { RawShaderMaterial } from 'three'
import { Float32BufferAttribute } from 'three'
import { Scene } from 'three'
import { WebGLRenderer } from 'three'
import { Mesh } from 'three'
import { BufferGeometry } from 'three'
import { Camera } from 'three'
import { OrthographicCamera } from 'three'
import { Vector2 } from 'three'

import { ImageDecoder } from '../../../image_decoder/image_decoder'

import { CameraModel } from './model'
import { VisualMesh } from './model'
import * as meshFragmentShader from './shaders/mesh.frag'
import * as meshVertexShader from './shaders/mesh.vert'

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
    meshMaterial.uniforms.image.value = this.decoder.texture
    meshMaterial.uniforms.dimensions.value = new Vector2(this.model.image!.width, this.model.image!.height)

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
      vertexShader: String(meshVertexShader),
      fragmentShader: String(meshFragmentShader),
      uniforms: {
        image: { type: 't' },
        dimensions: { value: new Vector2() },
      },
    })
  }

  private meshGeometry = createTransformer((mesh: VisualMesh): BufferGeometry => {

    const { rows, indices, neighbours, coordinates, classifications } = mesh

    const nElem = coordinates.length / 2

    // Cumulative sum so we can work out which row our segments are on
    const cRows = rows.reduce((acc, v, i) => {
      acc.push(acc[i] + v)
      return acc
    }, [0])

    // Calculate our position
    const position = ([] as number[]).concat(...indices.map(i => {
      // Which ring we are on as a value between 0 and 1
      const idx = bounds.le(cRows, i)
      const phi = idx / rows.length
      // How far around the ring we are as a value between 0 and 1
      const theta = (i - cRows[idx]) / rows[idx]
      return [phi, theta]
    }))


    // Calculate our triangle indexes
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

    // Calculate our uv for mapping images
    const uvs = coordinates

    const geometry = new BufferGeometry()
    geometry.setIndex(triangles)
    geometry.addAttribute('position', new Float32BufferAttribute(position, 2))
    geometry.addAttribute('classification', new Float32BufferAttribute(classifications.values, classifications.dim))
    geometry.addAttribute('uv', new Float32BufferAttribute(uvs, 2))

    return geometry
  }, (geometry?: BufferGeometry) => geometry && geometry.dispose())

}
