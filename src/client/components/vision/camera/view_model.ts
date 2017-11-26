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
import { Vector3 } from 'three'
import { Object3D } from 'three'
import { memoize } from '../../../base/memoize'
import { VisionRobotModel } from '../model'
import { VisionBallModel } from '../model'
import * as ballFragmentShader from './shaders/ball.frag'
import * as horizonFragmentShader from './shaders/horizon.frag'
import * as imageFragmentShader from './shaders/image.frag'
import * as imageVertexShader from './shaders/image.vert'
import * as simpleVertexShader from './shaders/simple.vert'

export class CameraViewModel {
  public renderer = memoize((canvas: HTMLCanvasElement) => {
    return new WebGLRenderer({ canvas })
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
      scene.add(this.horizon)
      scene.add(this.balls)
    }
    return scene
  }

  @computed
  private get plane(): Mesh {
    return new Mesh(this.planeGeometry, this.imageMaterial)
  }

  @computed
  private get horizon(): Mesh {
    return new Mesh(this.planeGeometry, this.horiztonMaterial)
  }

  @computed
  private get planeGeometry(): Geometry {
    return new PlaneGeometry(2, 2)
  }

  @computed
  private get horiztonMaterial(): Material {
    const material = new ShaderMaterial({
      vertexShader: String(simpleVertexShader),
      fragmentShader: String(horizonFragmentShader),
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
  private get imageMaterial(): Material {
    const material = new ShaderMaterial({
      vertexShader: String(imageVertexShader),
      fragmentShader: String(imageFragmentShader),
      uniforms: {
        sourceSize: { value: [1280, 1024, 1 / 1280, 1 / 1024] },
        firstRed: { value: [1, 0] },
        image: { value: this.imageTexture, type: 't' },
      },
    })
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

  @computed
  get balls(): Object3D {
    const mesh = new Object3D()
    this.robotModel.balls.forEach(ball => {
      mesh.add(BallViewModel.of(ball).ball)
    })
    return mesh
  }
}

class BallViewModel {
  constructor(private model: VisionBallModel) {
  }

  static of = createTransformer((ball: VisionBallModel) => {
    return new BallViewModel(ball)
  })

  @computed
  get ball(): Mesh {
    return new Mesh(this.geometry, this.material)
  }

  @computed
  get geometry(): Geometry {
    return new PlaneGeometry(2, 2)
  }

  @computed
  get material(): Material {
    const Hcw = new Matrix4().set(
      this.model.Hcw.x.x, this.model.Hcw.y.x, this.model.Hcw.z.x, this.model.Hcw.t.x,
      this.model.Hcw.x.y, this.model.Hcw.y.y, this.model.Hcw.z.y, this.model.Hcw.t.y,
      this.model.Hcw.x.z, this.model.Hcw.y.z, this.model.Hcw.z.z, this.model.Hcw.t.z,
      this.model.Hcw.x.t, this.model.Hcw.y.t, this.model.Hcw.z.t, this.model.Hcw.t.t,
    )
    const axis = new Vector3(this.model.axis.x, this.model.axis.y, this.model.axis.z)
    // const Hwc = new Matrix4().getInverse(Hcw);
    Hcw.setPosition(new Vector3(0, 0, 0))
    axis.applyMatrix4(Hcw)
    console.log(axis)
    console.log(this.model.gradient)
    const material = new ShaderMaterial({
      vertexShader: String(simpleVertexShader),
      fragmentShader: String(ballFragmentShader),
      uniforms: {
        axis: { value: axis },
        gradient: { value: this.model.gradient },
        imageSize: { value: [1280, 1024] },
      },
    })
    material.depthTest = false
    material.depthWrite = false
    material.transparent = true
    return material
  }
}
