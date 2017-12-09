import { computed } from 'mobx'
import { observable } from 'mobx'
import { Points } from 'three'
import { BufferAttribute } from 'three'
import { BufferGeometry } from 'three'
import { PerspectiveCamera } from 'three'
import { Scene } from 'three'
import { WebGLRenderer } from 'three'
import { LinearFilter } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { UnsignedByteType } from 'three'
import { LuminanceFormat } from 'three'
import { DataTexture } from 'three'
import { Texture } from 'three'
import { ShaderMaterial } from 'three'
import { Material } from 'three'
import { Camera } from 'three'
import { memoize } from '../../../base/memoize'
import { ColorSpaceVisualizerModel } from './model'
import * as fragmentShader from './shaders/color_space_cube.frag'
import * as vertexShader from './shaders/color_space_cube.vert'

export class ColorSpaceVisualizerViewModel {
  @observable.ref public canvas: HTMLCanvasElement | null

  constructor(private model: ColorSpaceVisualizerModel) {
  }

  public static of = memoize((model: ColorSpaceVisualizerModel) => {
    return new ColorSpaceVisualizerViewModel(model)
  })

  @computed
  get width() {
    return this.model.width
  }

  @computed
  get height() {
    return this.model.height
  }

  @computed
  get renderer(): WebGLRenderer {
    return new WebGLRenderer({
      canvas: this.canvas!,
    })
  }

  @computed
  get scene(): Scene {
    const scene = new Scene()
    scene.add(this.points)
    return scene
  }

  @computed
  get camera(): Camera {
    const camera = new PerspectiveCamera(75, 1, 0.1, 1000)
    // const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.up.set(0, 0, 1)
    camera.position.set(0, 0, 3)
    return camera
  }

  @computed
  get points(): Points {
    const points = new Points(this.pointsGeometry, this.planeMaterial)
    points.frustumCulled = false
    return points
  }

  @computed
  get pointsGeometry(): BufferGeometry {
    const lutSize = this.model.lut.data.length
    var geometry = new BufferGeometry()
    var vertices = new Float32Array(lutSize * 3)
    var index = 0
    var maxX = 2 ** this.model.lut.size.x
    var maxY = 2 ** this.model.lut.size.y
    var maxZ = 2 ** this.model.lut.size.z
    for (var r = 0; r < maxX; r++) {
      for (var g = 0; g < maxY; g++) {
        for (var b = 0; b < maxZ; b++) {
          vertices[index] = r
          vertices[index + 1] = g
          vertices[index + 2] = b
          index += 3
        }
      }
    }
    geometry.addAttribute('position', new BufferAttribute(vertices, 3))
    return geometry
  }

  @computed
  get planeMaterial(): Material {
    const material = new ShaderMaterial({
      vertexShader: String(vertexShader),
      fragmentShader: String(fragmentShader),
      uniforms: {
        lut: { value: this.lutTexture },
        lutSize: { value: 512 },
        bitsR: { value: this.model.lut.size.x },
        bitsG: { value: this.model.lut.size.y },
        bitsB: { value: this.model.lut.size.z },
        scale: { value: 1 },
        size: { value: 20 },
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
      this.model.lut.data,
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
