import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { BufferGeometry } from 'three'
import { PlaneBufferGeometry } from 'three'
import { MeshBasicMaterial } from 'three'
import { Scene } from 'three'
import { Mesh } from 'three'
import { WebGLRenderer } from 'three'
import { OrthographicCamera } from 'three'
import { Camera } from 'three'
import { Vector4 } from 'three'
import { RawShaderMaterial } from 'three'
import { Vector3 } from 'three'
import { Vector2 } from 'three'

import { ImageDecoder } from '../../../image_decoder/image_decoder'
import { Image } from '../../../image_decoder/image_decoder'
import { Matrix4 as Matrix4Model } from '../../../math/matrix4'

import { CameraModel } from './model'
import * as worldLineFragmentShader from './shaders/world_line.frag'
import * as worldLineVertexShader from './shaders/world_line.vert'


export class CameraViewModel {
  @observable.ref canvas: HTMLCanvasElement | null = null
  @observable viewWidth?: number
  @observable viewHeight?: number

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
      scene.add(this.image(this.model.image))
      scene.add(this.direction(this.model.image.Hcw))
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

  private image = createTransformer((image: Image): Mesh => {
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
  }): Mesh {

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

    // Get the shader and make a copy of it so we can set our own uniforms
    // This does not recompile the shader so we are fine
    const shader = this.worldLineShader.clone()

    shader.uniforms.viewSize = { value: new Vector2(this.viewWidth, this.viewHeight) }
    shader.uniforms.focalLength = { value: this.model.image!.lens.focalLength }
    shader.uniforms.axis = { value: axis }
    shader.uniforms.start = { value: start }
    shader.uniforms.end = { value: end }
    shader.uniforms.colour = { value: colour }
    shader.uniforms.lineWidth = { value: lineWidth }

    return new Mesh(this.quadGeometry, shader)
  }

  private horizon = createTransformer((m: Matrix4Model) => {
    return this.makeWorldLine({
      axis: new Vector3(m.z.x, m.z.y, m.z.z),
      colour: new Vector4(0, 0, 1, 0.7),
      lineWidth: 10,
    })
  })

  private direction = createTransformer((m: Matrix4Model) => {
    return this.makeWorldLine({
      axis: new Vector3(m.y.x, m.y.y, m.y.z),
      start: new Vector3(m.x.x, m.x.y, m.x.z),
      end: new Vector3(-m.z.x, -m.z.y, -m.z.z),
      colour: new Vector4(0.7, 0.7, 0.7, 0.5),
      lineWidth: 5,
    })
  })

  @computed
  private get worldLineShader() {
    return new RawShaderMaterial({
      vertexShader: String(worldLineVertexShader),
      fragmentShader: String(worldLineFragmentShader),
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
  }

  private imageMaterial = createTransformer((image: Image) => {

    // Cloning a material allows for new uniforms without recompiling the shader
    const mat = this.imageBasicMaterial.clone()
    mat.map = this.decoder.decode(image)
    return mat
  })
}
