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
import { ImageModel } from './model'
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

  renderer = createTransformer((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      return new WebGLRenderer({ canvas })
    }
  }, (renderer?: WebGLRenderer) => {
    if (renderer) {
      renderer.dispose()
    }
  })

  @computed
  get camera(): Camera {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3)
    camera.position.z = 2
    return camera
  }

  @computed
  get scene(): Scene {
    const scene = new Scene()
    if (this.model.image) {
      scene.add(this.image(this.model.image))
    }
    return scene
  }

  @computed
  get width() {
    return this.model.image ? this.model.image.width : 1280
  }

  @computed
  get height() {
    return this.model.image ? this.model.image.height : 1024
  }

  private image = createTransformer((image: ImageModel): Mesh => {
    const mesh =  new Mesh(this.quadGeometry, this.imageMaterial(image))
    mesh.scale.y = -1 // We need to flip Y to fix the image coordinates
    return mesh
  })

  @computed
  private get quadGeometry(): BufferGeometry {
    return new PlaneBufferGeometry(2, 2)
  }

  private imageMaterial = createTransformer((image: ImageModel) => {
    return new MeshBasicMaterial({
      map: this.imageTexture(image),
      depthTest: false,
      depthWrite: false,
    })
  }, (material?: MeshBasicMaterial) => {
    if (material) {
      material.dispose()
    }
  })

  // not computed as otherwise it will update the textures too frequently
  private imageTexture = createTransformer((image: ImageModel) => {
    switch (image.format) {
      case fourcc('GRBG'):
      case fourcc('RGGB'):
      case fourcc('GBRG'):
      case fourcc('BGGR'):
        return this.bayerTexture(image).texture
      case fourcc('RGB3'):
        return this.rgbTexture(image)
      case fourcc('YUYV'):
        return this.yuyvTexture(image)
      case fourcc('GREY'):
      case fourcc('GRAY'):
        return this.grayTexture(image)
      default:
        throw Error('Unsupported image format')
    }
  })

  private bayerTexture = createTransformer((image: ImageModel) => {
    // Now, I know these look bananas, but it's because the rawTexture has a flipY
    // If we don't do that then the image will be upside down in the output
    let firstRed
    switch (image.format) {
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

    const { width, height } = image
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
        image: { value: this.rawTexture(image), type: 't' },
      },
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new Mesh(this.quadGeometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)
    this.renderer(this.canvas)!.render(scene, this.camera, renderTarget)
    material.dispose()
    return renderTarget
  }, (target?: WebGLRenderTarget) => {
    if (target) {
      target.dispose()
      target.texture.dispose()
    }
  })

  private rgbTexture = createTransformer((image: ImageModel) => {
    const texture = new DataTexture(
      image.data,
      image.width,
      image.height,
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
  }, (texture?: Texture) => {
    if (texture) {
      texture.dispose()
    }
  })

  private yuyvTexture = createTransformer((image: ImageModel) => {
    throw Error('Write a shader for me!')
  }, (texture?: Texture) => {
    if (texture) {
      texture.dispose()
    }
  })

  private grayTexture = createTransformer((image: ImageModel) => {
    const texture = new DataTexture(
      image.data,
      image.width,
      image.height,
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
  }, (texture?: Texture) => {
    if (texture) {
      texture.dispose()
    }
  })

  private rawTexture = createTransformer((image: ImageModel) => {
    const texture = new DataTexture(
      image.data,
      image.width,
      image.height,
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
  }, (texture?: Texture) => {
    if (texture) {
      texture.dispose()
    }
  })
}
