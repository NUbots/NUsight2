import { computed } from 'mobx'
import { Geometry } from 'three'
import * as THREE from 'three'

import { fourccToString } from '../../../image_decoder/fourcc'
import { fourcc } from '../../../image_decoder/fourcc'
import { Vector3 } from '../../../math/vector3'
import { imageTexture } from '../../three/builders'
import { dataTexture } from '../../three/builders'
import { meshBasicMaterial } from '../../three/builders'
import { shaderMaterial } from '../../three/builders'
import { rawShader } from '../../three/builders'
import { mesh } from '../../three/builders'
import { planeGeometry } from '../../three/builders'

import fragmentShader from './shaders/bayer.frag'
import vertexShader from './shaders/bayer.vert'

export type Image = ImageData | ImageElement

export interface ImageData {
  type: 'data',
  width: number,
  height: number,
  data: Uint8Array,
  format: number,
}

export interface ImageElement {
  type: 'element',
  width: number,
  height: number,
  element: HTMLImageElement,
  format: number,
}

export class ImageView {
  constructor(
    private readonly imageSource: Image,
    private readonly geometry: () => Geometry,
  ) {
  }

  static of(imageSource: Image) {
    return new ImageView(imageSource, ImageView.geometry)
  }

  private static geometry = planeGeometry(() => ({ width: 2, height: 2 }))

  readonly image = mesh(() => ({
    geometry: this.geometry(),
    material: this.material,
    // Normally this effect could be achieved by setting texture.flipY to make
    // the textures the correct way up again. However this is ignored on RenderTargets
    // We can't flip it at the raw stage either as this would invert things like the Bayer pattern.
    // Instead we just leave everything flipped and correct it here by scaling by -1 on the y axis
    scale: new Vector3(1, -1, 1),
  }))

  @computed
  private get material() {
    switch (this.imageSource.format) {
      case fourcc('JPEG'):
        return this.basicMaterial()
      default:
        return this.bayerMaterial()
    }
  }

  private readonly basicMaterial = meshBasicMaterial(() => ({ map: this.texture }))

  private readonly bayerMaterial = shaderMaterial(() => ({
    shader: this.bayerShader,
    depthTest: false,
    uniforms: {
      image: { value: this.texture },
      sourceSize: {
        value: [
          this.imageSource.width,
          this.imageSource.height,
          1 / this.imageSource.width,
          1 / this.imageSource.height,
        ],
      },
      firstRed: { value: this.firstRed },
      mosaicSize: { value: this.mosaicSize },
    },
  }))

  private readonly bayerShader = rawShader(() => ({ vertexShader, fragmentShader }))

  @computed
  private get texture() {
    switch (this.imageSource.type) {
      case 'data':
        return this.dataTexture(this.imageSource)
      case 'element':
        return this.elementTexture(this.imageSource)
    }
  }

  private readonly elementTexture = imageTexture(({ element, width, height }: ImageElement) => ({
    image: element, width, height,
    format: THREE.RGBAFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  }))

  private readonly dataTexture = dataTexture(({ data, width, height }: ImageData) => ({
    data, width, height,
    format: THREE.LuminanceFormat,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  }))

  @computed
  private get firstRed(): [number, number] {
    switch (this.imageSource.format) {
      case fourcc('JPBG'):
      case fourcc('BGGR'):
      case fourcc('PJBG'):
        return [1, 1]
      case fourcc('JPGR'):
      case fourcc('GRBG'):
      case fourcc('PJGR'):
        return [1, 0]
      case fourcc('JPGB'):
      case fourcc('GBRG'):
      case fourcc('PJGB'):
        return [0, 1]
      case fourcc('JPRG'):
      case fourcc('RGGB'):
      case fourcc('PJRG'):
        return [0, 0]
      default:
        throw Error(`Unsupported image format ${fourccToString(this.imageSource.format)}`)
    }
  }


  @computed
  private get mosaicSize(): number {
    switch (this.imageSource.format) {
      case fourcc('BGGR'): // Colour Bayer
      case fourcc('RGGB'): // Colour Bayer
      case fourcc('GRBG'): // Colour Bayer
      case fourcc('GBRG'): // Colour Bayer
        return 1 // One value per width/height
      case fourcc('JPBG'): // Permuted Colour Bayer
      case fourcc('JPRG'): // Permuted Colour Bayer
      case fourcc('JPGR'): // Permuted Colour Bayer
      case fourcc('JPGB'): // Permuted Colour Bayer
      case fourcc('PJPG'): // Permuted Polarized Monochrome
      case fourcc('PY8 '): // Polarized Monochrome
        return 2 // Two values per width/height
      case fourcc('PBG8'): // Polarized Colour Bayer
      case fourcc('PRG8'): // Polarized Colour Bayer
      case fourcc('PGR8'): // Polarized Colour Bayer
      case fourcc('PGB8'): // Polarized Colour Bayer
      case fourcc('PJBG'): // Permuted Polarized Colour
      case fourcc('PJRG'): // Permuted Polarized Colour
      case fourcc('PJGR'): // Permuted Polarized Colour
      case fourcc('PJGB'): // Permuted Polarized Colour
        return 4 // Four values per width/height
      default:
        return 0
    }
  }
}
