import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { BufferGeometry } from 'three'
import { PlaneBufferGeometry } from 'three'
import { RawShaderMaterial } from 'three'
import { MeshBasicMaterial } from 'three'
import { BufferAttribute } from 'three'
import { WebGLRenderTarget } from 'three'
import { Scene } from 'three'
import { Mesh } from 'three'
import { WebGLRenderer } from 'three'
import { Camera } from 'three'
import { OrthographicCamera } from 'three'
import { Material } from 'three'
import { DataTexture } from 'three'
import { LuminanceFormat } from 'three'
import { Object3D } from 'three'
import { RGBFormat } from 'three'
import { Texture } from 'three'
import { UnsignedByteType } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { LinearFilter } from 'three'
import { NearestFilter } from 'three'
import { Vector4 } from 'three'
import { Vector3 } from 'three'
import { Vector2 } from 'three'

import { Matrix4 as Matrix4Model } from '../../../math/matrix4'

import { CameraModel } from './model'
import { ImageModel } from './model'
import * as bayerFragmentShader from './shaders/bayer.frag'
import * as bayerVertexShader from './shaders/bayer.vert'
import * as worldLineFragmentShader from './shaders/world_line.frag'
import * as worldLineVertexShader from './shaders/world_line.vert'

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

export class CameraViewModel {
  @observable.ref canvas: HTMLCanvasElement | null = null
  @observable viewWidth?: number
  @observable viewHeight?: number

  constructor(
    private model: CameraModel,
    // We cache both the scene and the camera here as THREE.js uses these objects to store its own render lists.
    // So to conserve memory, it is best to keep them referentially identical across renders.
    private scene: Scene,
    private camera: Camera,
  ) {
  }

  static of = createTransformer((model: CameraModel) => {
    return new CameraViewModel(
      model,
      new Scene(),
      new OrthographicCamera(-1, 1, 1, -1, 1, 3),
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

  renderer = createTransformer((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      return new WebGLRenderer({ canvas })
    }
  }, renderer => renderer && renderer.dispose())

  getCamera(): Camera {
    const camera = this.camera
    camera.position.z = 2
    return camera
  }

  getScene(): Scene {
    const scene = this.scene
    scene.remove(...scene.children)
    if (this.model.image) {
      scene.add(this.image(this.model.image))
      scene.add(this.horizon(this.model.image.Hcw))
    }
    return scene
  }

  @computed
  get imageWidth(): number | undefined {
    return this.model.image && this.model.image.width
  }

  @computed
  get imageHeight(): number | undefined  {
    return this.model.image && this.model.image.height
  }

  private image = createTransformer((image: ImageModel): Mesh => {
    const mesh = new Mesh(this.quadGeometry, this.imageMaterial(image))

    // Normally this effect could be achieved by setting texture.flipY to make
    // the textures the correct way up again. However this is ignored on RenderTargets
    // We can't flip it at the raw stage either as this would invert things like the Bayer pattern.
    // Instead we just leave everything flipped and correct it here by scaling by -1 on the y axis
    mesh.scale.y = -1
    return mesh
  })

  @computed
  private get quadGeometry(): BufferGeometry {
    return new PlaneBufferGeometry(2, 2)
  }

  // This shader must be stored separately as a computed field as if we make it new each time,
  // it will get compiled each time which is quite expensive.
  @computed
  private get imageBasicMaterial() {
    return new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
    })
  }

  private horizon = createTransformer((m: Matrix4Model) => {
    const obj = new Object3D()
    obj.add(new Mesh(this.horizonGeometry(m), this.worldLineMaterial))
    obj.add(new Mesh(this.directionGeometry(m), this.worldLineMaterial))
    return obj
  })

  /**
   * There are three different combinations of parameters we can accept.
   * Just an axis means draw a line around this entire plane
   * Just a start and end implies that the axis is `cross(start, end)` and is straight
   * An axis plus a start + end means draw a line segment around axis from start to end
   */
  private makeWorldLine({ axis, start, end, colour, lineWidth }: {
    axis?: Vector3,
    start?: Vector3,
    end?: Vector3,
    colour?: Vector4,
    lineWidth?: number
  }): BufferGeometry {

    // If we don't have an axis, derive it from start and end
    if (!axis) {
      if (start && end) {
        axis = new Vector3()
        axis.crossVectors(start, end)
      } else {
        throw new Error('No axis was provided and there was no start and end to derive it')
      }
    }

    // If we don't have a start, we need to generate one from axis or end
    if (!start) {
      if (end) {
        start = end
      } else if (axis) {
        if (!axis.x && !axis.y) {
          start = new Vector3(0, 1, 0)
        } else {
          start = new Vector3(-axis.y, axis.x, 0).normalize()
        }
      } else {
        throw new Error('No start point was provided, and no axis to derive one')
      }
    }

    // If we don't have an end, it's the start
    if (!end) {
      end = start
    }

    colour = colour || new Vector4(0, 0, 1, 1)
    lineWidth = lineWidth || 8

    // Make our geometry
    const geom = new PlaneBufferGeometry(2, 2)

    // Copy across our attributes with four copies, one for each vertex
    geom.addAttribute(
      'axis',
      new BufferAttribute(new Float32Array(12), 3).copyVector3sArray([axis, axis, axis, axis]),
    )
    geom.addAttribute(
      'start',
      new BufferAttribute(new Float32Array(12), 3).copyVector3sArray([start, start, start, start]),
    )
    geom.addAttribute(
      'end',
      new BufferAttribute(new Float32Array(12), 3).copyVector3sArray([end, end, end, end]),
    )
    geom.addAttribute(
      'colour',
      new BufferAttribute(new Float32Array(16), 4).copyVector4sArray([colour, colour, colour, colour]),
    )
    geom.addAttribute(
      'lineWidth',
      new BufferAttribute(new Float32Array(4), 1).copyArray([lineWidth, lineWidth, lineWidth, lineWidth]),
    )

    return geom
  }

  private horizonGeometry = createTransformer((m: Matrix4Model) => {
    return this.makeWorldLine({
      axis: new Vector3(m.z.x, m.z.y, m.z.z),
      colour: new Vector4(0, 0, 1, 0.7),
      lineWidth: 10,
    })
  }, (geometry?: BufferGeometry) => geometry && geometry.dispose())

  private directionGeometry = createTransformer((m: Matrix4Model) => {

    return this.makeWorldLine({
      axis: new Vector3(m.y.x, m.y.y, m.y.z),
      start: new Vector3(m.x.x, m.x.y, m.x.z),
      end: new Vector3(-m.x.x, -m.x.y, -m.x.z),
      colour: new Vector4(0.7, 0.7, 0.7, 0.5),
      lineWidth: 5,
    })

  }, (geometry?: BufferGeometry) => geometry && geometry.dispose())

  @computed
  private get worldLineShader() {
    return new RawShaderMaterial({
      vertexShader: String(worldLineVertexShader),
      fragmentShader: String(worldLineFragmentShader),
      depthTest: false,
      depthWrite: false,
      transparent: true,
      uniforms: {
        viewSize: { v: new Vector2() },
        focalLength: { v: 1 },
      },
    })
  }

  @computed // This is separated from the shader so the shader does not have to recompile
  private get worldLineMaterial() {
    const shader = this.worldLineShader

    shader.uniforms.viewSize.value = new Vector2(this.viewWidth, this.viewHeight)
    shader.uniforms.focalLength.value = this.model.image!.lens.focalLength

    return shader
  }

  private imageMaterial = createTransformer((image: ImageModel) => {
    const mat = this.imageBasicMaterial

    // TODO: This is wrong and not very reactive however the alternative is recompiling the shader every time
    // you have a better idea?
    mat.map = this.imageTexture(image)
    return mat
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
      case fourcc('GREY'):
      case fourcc('GRAY'):
        return this.grayTexture(image)
      default:
        throw Error(`Unsupported image format ${image.format}`)
    }
  })

  // This shader must be stored separately as a computed field as if we make it new each time,
  // it will get compiled each time which is quite expensive.
  @computed
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
    const scene = new Scene()
    const material = this.bayerShader

    // TODO: This is wrong and not very reactive however the alternative is recompiling the shader every time
    // you have a better idea?
    material.uniforms.sourceSize = { value: [width, height, 1 / width, 1 / height] }
    material.uniforms.firstRed = { value: firstRed }
    material.uniforms.image = { value: this.rawTexture(image) }

    const mesh = new Mesh(this.quadGeometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)
    this.renderer(this.canvas)!.render(scene, this.getCamera(), renderTarget)
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
