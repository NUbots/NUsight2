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
import { memoize } from '../../../base/memoize'
import { VisionRobotModel } from '../model'
import * as fragmentShader from './shaders/image.frag'
// import * as fragmentShader from './shaders/simple2.frag'
// import * as fragmentShader from './shaders/simple.frag'
import * as vertexShader from './shaders/image.vert'

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
    }
    return scene
  }

  @computed
  private get plane(): Mesh {
    return new Mesh(this.planeGeometry, this.planeMaterial)
  }

  @computed
  private get planeGeometry(): Geometry {
    return new PlaneGeometry(2, 2)
  }

  @computed
  private get planeMaterial(): Material {
    return new ShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
      uniforms: {
        sourceSize: { value: [1280, 1024, 1 / 1280, 1 / 1024] },
        firstRed: { value: [1, 0] },
        image: { value: this.imageTexture, type: 't' },
      },
    })
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
