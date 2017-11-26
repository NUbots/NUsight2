import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Scene } from 'three'
import { Mesh } from 'three'
import { WebGLRenderer } from 'three'
import { Camera } from 'three'
import { OrthographicCamera } from 'three'
import { ShaderMaterial } from 'three'
import { Geometry } from 'three'
import { Material } from 'three'
import { DataTexture } from 'three'
import { LuminanceFormat } from 'three'
import { Texture } from 'three'
import { UnsignedByteType } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { LinearFilter } from 'three'
import { PlaneGeometry } from 'three'
import { Matrix4 } from 'three'
import { CustomBlending } from 'three'
import { AddEquation } from 'three'
import { SrcAlphaFactor } from 'three'
import { OneMinusSrcAlphaFactor } from 'three'
import { memoize } from '../../../base/memoize'
import { VisionRobotModel } from '../model'
import * as fragmentShader2 from './shaders/horizon.frag'
import * as fragmentShader from './shaders/image.frag'
import * as vertexShader from './shaders/image.vert'
// import * as fragmentShader from './shaders/simple2.frag'
// import * as fragmentShader from './shaders/simple.frag'
import * as vertexShader2 from './shaders/simple.vert'

export class CameraViewModel {
  public renderer = memoize((canvas: HTMLCanvasElement) => {
    const renderer = new WebGLRenderer({
      canvas,
      // alpha: false,
      // premultipliedAlpha: false,
    })
    renderer.setClearColor('#000')
    return renderer
  })

  public constructor(private robotModel: VisionRobotModel) {
  }

  public static of = createTransformer((robotModel: VisionRobotModel) => {
    return new CameraViewModel(robotModel)
  })

  @computed
  public get camera(): Camera {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.position.z = 1
    return camera
  }

  @computed
  public get scene(): Scene {
    const scene = new Scene()
    if (this.robotModel.image.get()) {
      scene.add(this.plane)
      scene.add(this.plane2)
    }
    return scene
  }

  @computed
  private get plane(): Mesh {
    return new Mesh(this.planeGeometry, this.planeMaterial)
  }

  @computed
  private get plane2(): Mesh {
    return new Mesh(this.planeGeometry, this.planeMaterial2)
  }

  @computed
  private get planeGeometry(): Geometry {
    return new PlaneGeometry(2, 2)
  }

  @computed
  private get planeMaterial2(): Material {
    const material = new ShaderMaterial({
      vertexShader: String(vertexShader2),
      fragmentShader: String(fragmentShader2),
      uniforms: {
        imageSize: { value: [1280, 1024] },
        Hcw: {
          value: new Matrix4().set(
            this.robotModel.Hcw.x.x, this.robotModel.Hcw.y.x, this.robotModel.Hcw.z.x, this.robotModel.Hcw.t.x,
            this.robotModel.Hcw.x.y, this.robotModel.Hcw.y.y, this.robotModel.Hcw.z.y, this.robotModel.Hcw.t.y,
            this.robotModel.Hcw.x.z, this.robotModel.Hcw.y.z, this.robotModel.Hcw.z.z, this.robotModel.Hcw.t.z,
            this.robotModel.Hcw.x.t, this.robotModel.Hcw.y.t, this.robotModel.Hcw.z.t, this.robotModel.Hcw.t.t,
          ),
        },
      },
    })
    material.depthTest = false
    material.depthWrite = false
    material.transparent = true
    return material
  }

  @computed
  private get planeMaterial(): Material {
    const material = new ShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
      uniforms: {
        sourceSize: { value: [1280, 1024, 1 / 1280, 1 / 1024] },
        firstRed: { value: [1, 0] },
        image: { value: this.imageTexture, type: 't' },
      },
    })
    material.blending = CustomBlending
    material.blendEquation = AddEquation
    material.blendSrc = SrcAlphaFactor
    material.blendDst = OneMinusSrcAlphaFactor
    material.premultipliedAlpha = false
    material.depthTest = false
    material.depthWrite = false
    return material
  }

  @computed
  private get imageTexture(): Texture {
    const texture = new DataTexture(
      this.robotModel.image.get(),
      1280,
      1024,
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
