import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { BufferGeometry } from 'three'
import { PlaneBufferGeometry } from 'three'
import { RawShaderMaterial } from 'three'
import { MeshBasicMaterial } from 'three'
import { WebGLRenderTarget } from 'three'
import { Scene } from 'three'
import { Mesh } from 'three'
import { WebGLRenderer } from 'three'
import { Camera } from 'three'
import { Object3D } from 'three'
import { OrthographicCamera } from 'three'
import { Material } from 'three'
import { DataTexture } from 'three'
import { LuminanceFormat } from 'three'
import { RGBFormat } from 'three'
import { Texture } from 'three'
import { UnsignedByteType } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { LinearFilter } from 'three'
import { NearestFilter } from 'three'
import { PlaneGeometry } from 'three'
import { Matrix4 } from 'three'
import { Vector3 } from 'three'
import { Geometry } from 'three'

import { memoize } from '../../../base/memoize'

import { CameraModel } from './model'
import * as bayerFragmentShader from './shaders/bayer.frag'
import * as bayerVertexShader from './shaders/bayer.vert'

export function fourcc(code: string): number {
  return code.charCodeAt(3) << 24 | code.charCodeAt(2) << 16 | code.charCodeAt(1) << 8 | code.charCodeAt(0)
}

export class CameraViewModel {
  @observable.ref canvas: HTMLCanvasElement | null = null

  constructor(private model: CameraModel) {
  }

  static of = memoize((model: CameraModel) => {
    return new CameraViewModel(model)
  })

  @computed
  get id() {
    return this.model.id
  }

  @computed
  get name() {
    return this.model.name
  }

  @computed
  get renderer(): WebGLRenderer | undefined {
    if (this.canvas) {
      return new WebGLRenderer({ canvas: this.canvas })
    }
  }

  @computed
  get camera(): Camera {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3)
    camera.position.z = 2
    return camera
  }

  // not computed as otherwise it will update the textures too frequently
  get scene(): Scene {
    const scene = new Scene()
    if (this.model.image) {
      scene.add(this.image)
    }
    return scene
  }

  // not computed as otherwise it will update the textures too frequently
  private get image(): Mesh {
    const mesh =  new Mesh(this.quadGeometry, this.imageMaterial)
    mesh.scale.y = -1 // We need to flip Y to fix the image coordinates
    return mesh
  }

  @computed
  private get quadGeometry(): BufferGeometry {
    return new PlaneBufferGeometry(2, 2)
  }

  @computed
  private get imageMaterial() {
    return new MeshBasicMaterial({
      map: this.imageTexture,
      depthTest: false,
      depthWrite: false,
    })
  }

  // not computed as otherwise it will update the textures too frequently
  private get imageTexture(): Texture {
    switch (this.model.image!.format) {
      case fourcc('GRBG'):
      case fourcc('RGGB'):
      case fourcc('GBRG'):
      case fourcc('BGGR'):
        return this.bayerTexture
      case fourcc('RGB3'):
        return this.rgbTexture
      case fourcc('YUYV'):
        return this.yuyvTexture
      case fourcc('GREY'):
      case fourcc('GRAY'):
        return this.grayTexture
      default:
        throw Error('Unsupported image format')
    }
  }

  // not computed as otherwise it will update the textures too frequently
  private get bayerTexture(): Texture {

    // Now, I know these look bananas, but it's because the rawTexture has a flipY
    // If we don't do that then the image will be upside down in the output
    let firstRed
    switch (this.model.image!.format) {
      case fourcc('GRBG'):
        firstRed = [1, 0]
        break
      case fourcc('RGGB'):
        firstRed = [0, 0]
        break
      case fourcc('GBRG'):
        firstRed = [0, 1]
        break
      case fourcc('BGGR'):
        firstRed = [1, 1]
        break
    }

    const { width, height } = this.model.image!
    const renderTarget = new WebGLRenderTarget(width, height)
    renderTarget.depthBuffer = false
    renderTarget.stencilBuffer = false
    const scene = new Scene()
    const material = new RawShaderMaterial({
      vertexShader: String(bayerVertexShader),
      fragmentShader: String(bayerFragmentShader),
      uniforms: {
        sourceSize: { value: [width, height, 1 / width, 1 / height] },
        firstRed: { value: firstRed },
        image: { value: this.rawTexture, type: 't' },
      },
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new Mesh(this.quadGeometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)
    this.renderer!.render(scene, this.camera, renderTarget)
    return renderTarget.texture
  }

  // This can be computed as it's a cheap operation
  @computed
  private get rgbTexture(): Texture {
    const texture = new DataTexture(
      this.model.image!.data,
      this.model.image!.width,
      this.model.image!.height,
      RGBFormat,
      UnsignedByteType,
      Texture.DEFAULT_MAPPING,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      LinearFilter,
      LinearFilter,
    )
    texture.flipY = false
    texture.needsUpdate = true
    return texture
  }

  // not computed as otherwise it will update the textures too frequently
  private get yuyvTexture(): Texture {
    throw Error('Write a shader for me!')
  }

  @computed
  private get grayTexture(): Texture {
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
    texture.flipY = false
    texture.needsUpdate = true
    return texture
  }

  @computed
  private get rawTexture(): Texture {
    const texture = new DataTexture(
      this.model.image!.data,
      this.model.image!.width,
      this.model.image!.height,
      LuminanceFormat,
      UnsignedByteType,
      Texture.DEFAULT_MAPPING,
      ClampToEdgeWrapping,
      ClampToEdgeWrapping,
      NearestFilter,
      NearestFilter,
    )
    texture.needsUpdate = true
    return texture
  }
}
