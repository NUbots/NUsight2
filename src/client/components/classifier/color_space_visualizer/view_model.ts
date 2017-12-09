import { computed } from 'mobx'
import { observable } from 'mobx'
import { Scene } from 'three'
import { WebGLRenderer } from 'three'
import { LinearFilter } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { UnsignedByteType } from 'three'
import { LuminanceFormat } from 'three'
import { DataTexture } from 'three'
import { Texture } from 'three'
import { ShaderMaterial } from 'three'
import { Material } from 'three'
import { PlaneGeometry } from 'three'
import { Geometry } from 'three'
import { Mesh } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { memoize } from '../../../base/memoize'
import { ColorSpaceVisualzerModel } from './model'
import * as fragmentShader from './shaders/simple.frag'
import * as vertexShader from './shaders/simple.vert'

export class ColorSpaceVisualizerViewModel {
  @observable.ref canvas: HTMLCanvasElement | null

  constructor(private model: ColorSpaceVisualzerModel) {
  }

  public static of = memoize((model: ColorSpaceVisualzerModel) => {
    return new ColorSpaceVisualizerViewModel(model)
  })

  @computed
  get width() {
    return this.model.width
  }

  @computed
  get height() {
    return this.model.height
  }

  @computed
  get renderer(): WebGLRenderer {
    return new WebGLRenderer({
      canvas: this.canvas!,
    })
  }

  @computed
  get scene(): Scene {
    const scene = new Scene()
    scene.add(this.plane)
    return scene
  }

  @computed
  get camera(): Camera {
    // const camera = new PerspectiveCamera(75, this.model.aspect, 0.01, 100)
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.up.set(0, 0, 1)
    camera.position.set(0, 0, 1)
    return camera
  }

  @computed
  get plane(): Mesh {
    const mesh = new Mesh(this.planeGeometry, this.planeMaterial)
    mesh.frustumCulled = false
    return mesh
  }

  @computed
  get planeGeometry(): Geometry {
    return new PlaneGeometry(2, 2)
  }

  @computed
  get planeMaterial(): Material {
    const material = new ShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
      uniforms: {
        lut: { value: this.lutTexture },
        lutSize: { value: 512 },
        bitsR: { value: this.model.lut.size.x },
        bitsG: { value: this.model.lut.size.y },
        bitsB: { value: this.model.lut.size.z },
        scale: { value: 1 },
        size: { value: 1 },
        renderRaw: { value: false },
        renderCube: { value: false },
        outputColourSpace: { value: 1 },
      },
    })
    material.depthTest = false
    return material
  }

  @computed
  get lutTexture(): Texture {
    const texture = new DataTexture(
      this.model.lut.data,
      512,
      512,
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
}
