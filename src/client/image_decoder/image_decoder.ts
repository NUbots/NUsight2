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
import { Vector2 } from 'three'
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
import { Camera } from 'three'

import { memoize } from '../base/memoize'

import * as bayerFragmentShader from './shaders/bayer.frag'
import * as bayerVertexShader from './shaders/bayer.vert'

/**
 * Convert a four letter string into its integer fourcc code (see http://fourcc.org/)
 * This code allows identification of a stream using the integer.
 *
 * @param code four letters that describe the format
 *
 * @return the fourcc integer code for this format
 */
export function fourcc(code: string): number {
  return code.charCodeAt(3) << 24 | code.charCodeAt(2) << 16 | code.charCodeAt(1) << 8 | code.charCodeAt(0)
}

export interface ImageModelOpts {
  width: number
  height: number
  format: number
  data: Uint8Array
}

export class ImageModel {
  @observable width: number
  @observable height: number
  @observable format: number
  @observable.ref data: Uint8Array

  constructor({ width, height, format, data }: ImageModelOpts) {
    this.width = width
    this.height = height
    this.format = format
    this.data = data
  }

  static of({ width, height, format, data }: ImageModelOpts) {
    return new ImageModel({ width, height, format, data })
  }
}

export class ImageDecoder {

  constructor(private renderer: WebGLRenderer,
              private scene: Scene,
              private camera: Camera,
              private geometry: BufferGeometry) {
  }

  static of = memoize((renderer: WebGLRenderer) => {
    return new ImageDecoder(
      renderer,
      new Scene(),
      new OrthographicCamera(-1, 1, 1, -1, 0, 1),
      new PlaneBufferGeometry(2, 2),
    )
  })

  decode = createTransformer((image: ImageModel) => {
    switch (image.format) {
      case fourcc('GRBG'):
      case fourcc('RGGB'):
      case fourcc('GBRG'):
      case fourcc('BGGR'):
        return this.bayerTexture(image).texture
      case fourcc('RGB3'):
        return this.rgbTexture(image)
      case fourcc('GREY'):
      case fourcc('GRAY'):
        return this.grayTexture(image)
      default:
        throw Error(`Unsupported image format ${image.format}`)
    }
  })

  // This shader must be stored separately as a computed field as if we make it new each time,
  // it will get compiled each time which is quite expensive.
  private get bayerShader() {
    return new RawShaderMaterial({
      vertexShader: String(bayerVertexShader),
      fragmentShader: String(bayerFragmentShader),
      uniforms: {
        sourceSize: { value: new Vector4() },
        firstRed: { value: new Vector2() },
        image: { type: 't' },
      },
      depthTest: false,
      depthWrite: false,
    })
  }

  private bayerTexture = createTransformer((image: ImageModel) => {
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
    const material = this.bayerShader

    // TODO: This is wrong and not very reactive however the alternative is recompiling the shader every time
    // you have a better idea?
    material.uniforms.sourceSize = { value: [width, height, 1 / width, 1 / height] }
    material.uniforms.firstRed = { value: firstRed }
    material.uniforms.image = { value: this.rawTexture(image) }

    const mesh = new Mesh(this.geometry, material)
    mesh.frustumCulled = false

    // Cleanup last render
    const scene = this.scene
    scene.remove(...this.scene.children)
    scene.add(mesh)

    this.renderer!.render(scene, this.camera, renderTarget)
    return renderTarget
  }, target => {
    if (target) {
      target.texture.dispose()
      target.dispose()
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
  }, texture => texture && texture.dispose())

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
  }, texture => texture && texture.dispose())

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
  }, texture => texture && texture.dispose())
}
