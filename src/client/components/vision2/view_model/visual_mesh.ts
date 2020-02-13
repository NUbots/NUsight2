import { RawShaderMaterial } from 'three'
import * as THREE from 'three'

import { disposableComputed } from '../../../base/disposable_computed'
import { interleavedBuffer } from '../../three/builders'
import { shaderMaterial } from '../../three/builders'
import { rawShader } from '../../three/builders'
import { mesh } from '../../three/builders'
import { Canvas } from '../../three/three'
import { VisualMesh } from '../camera/model'
import { VisionImage } from '../camera/model'

import fragmentShader from './shaders/mesh.frag'
import vertexShader from './shaders/mesh.vert'

export class VisualMeshViewModel {
  constructor(
    private readonly canvas: Canvas,
    private readonly model: VisualMesh,
    private readonly image: VisionImage,
    private readonly shader: () => RawShaderMaterial,
  ) {
  }

  static of(canvas: Canvas, model: VisualMesh, image: VisionImage): VisualMeshViewModel {
    return new VisualMeshViewModel(canvas, model, image, VisualMeshViewModel.shader)
  }

  readonly visualmesh = mesh(() => ({
    geometry: this.geometry.get(),
    material: this.material(),
    frustumCulled: false,
  }))

  private geometry = disposableComputed<THREE.BufferGeometry>(() => {
    const { neighbours, rays } = this.model

    // Calculate our triangle indexes
    const nElem = rays.length / 3
    const triangles = []
    for (let i = 0; i < nElem; i++) {
      const ni = i * 6
      if (neighbours[ni + 0] < nElem) {
        if (neighbours[ni + 2] < nElem) {
          triangles.push(i, neighbours[ni + 0], neighbours[ni + 2])
        }
        if (neighbours[ni + 1] < nElem) {
          triangles.push(i, neighbours[ni + 1], neighbours[ni + 0])
        }
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setIndex(triangles)
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(rays, 3))

    // Read each class into a separate attribute
    const buffer = this.buffer()

    // Add our classification objects
    geometry.addAttribute(`ball`, new THREE.InterleavedBufferAttribute(buffer, 1, 0))
    geometry.addAttribute(`goal`, new THREE.InterleavedBufferAttribute(buffer, 1, 1))
    geometry.addAttribute(`fieldLine`, new THREE.InterleavedBufferAttribute(buffer, 1, 2))
    geometry.addAttribute(`field`, new THREE.InterleavedBufferAttribute(buffer, 1, 3))
    geometry.addAttribute(`environment`, new THREE.InterleavedBufferAttribute(buffer, 1, 4))

    return geometry
  })

  private readonly buffer = interleavedBuffer(() => ({
    buffer: new Float32Array(this.model.classifications.values.slice(0, -this.model.classifications.dim)),
    stride: this.model.classifications.dim,
  }))

  private readonly material = shaderMaterial(() => ({
    shader: this.shader,
    uniforms: {
      Hcw: { value: this.Hcw },
      viewSize: { value: new THREE.Vector2(this.canvas.width, this.canvas.height) },
      focalLength: { value: this.image.lens.focalLength },
      centre: { value: new THREE.Vector2(this.image.lens.centre.x, this.image.lens.centre.y) },
      projection: { value: this.image.lens.projection },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  }))

  private static readonly shader = rawShader(() => ({ vertexShader, fragmentShader }))

  private get Hcw() {
    return new THREE.Matrix4().extractRotation(this.image.Hcw.toThree())
  }
}
