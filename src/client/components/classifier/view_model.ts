import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { WebGLRenderer } from 'three'
import { Camera } from 'three'
import { Scene } from 'three'
import { Mesh } from 'three'
import { Material } from 'three'
import { Geometry } from 'three'
import { ShaderMaterial } from 'three'
import { Texture } from 'three'
import { DataTexture } from 'three'
import { LuminanceFormat } from 'three'
import { UnsignedByteType } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { LinearFilter } from 'three'
import { Renderer } from 'three'
import { PlaneGeometry } from 'three'
import { OrthographicCamera } from 'three'
import { ClassifierModel } from './model'
import { ClassifierRobotModel } from './model'
// import * as fragmentShader from './shaders/visual_lut.frag'
// import * as vertexShader from './shaders/visual_lut.vert'
import * as fragmentShader from './shaders/simple.frag'
import * as vertexShader from './shaders/simple.vert'

export class ClassifierViewModel {
  public static of = createTransformer((model: ClassifierModel) => {
    return new ClassifierViewModel(model)
  })

  constructor(private model: ClassifierModel) {
  }

  @computed
  get robots(): ClassifierRobotViewModel[] {
    return this.model.robots
      .filter(robot => robot.visible)
      .map(robot => ClassifierRobotViewModel.of(robot))
  }
}

export class ClassifierRobotViewModel {
  public renderer = createTransformer((canvas: HTMLCanvasElement): Renderer => {
    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
    })
    renderer.setClearColor('#ffffff')
    // renderer.setViewport(1, 1)
    return renderer
  })

  constructor(private model: ClassifierRobotModel) {

  }

  public static of = createTransformer((model: ClassifierRobotModel) => {
    return new ClassifierRobotViewModel(model)
  })

  @computed
  get id(): string {
    return this.model.id
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
        bitsR: { value: this.model.bitsX },
        bitsG: { value: this.model.bitsY },
        bitsB: { value: this.model.bitsZ },
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
      this.model.lut.get().data,
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
