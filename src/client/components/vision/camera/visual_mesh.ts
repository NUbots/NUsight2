import * as THREE from 'three'
import { Vector2 } from '../../../math/vector2'
import { bufferGeometry } from '../../three/builders'
import { rawShader } from '../../three/builders'
import { shaderMaterial } from '../../three/builders'
import { mesh } from '../../three/builders'
import { Canvas } from '../../three/three'
import { CameraParams } from './model'
import { VisualMesh } from './model'
import fragmentShader from './shaders/visual_mesh.frag'
import vertexShader from './shaders/visual_mesh.vert'

export class VisualMeshViewModel {
  constructor(
    private readonly canvas: Canvas,
    private readonly visualMesh: VisualMesh,
    private readonly params: CameraParams,
  ) {}

  static of(canvas: Canvas, visualMesh: VisualMesh, params: CameraParams) {
    return new VisualMeshViewModel(canvas, visualMesh, params)
  }

  readonly visualmesh = mesh(() => ({
    geometry: this.geometry(),
    material: this.material(),
  }))

  private readonly geometry = bufferGeometry(() => {
    const { neighbours, rays, classifications } = this.visualMesh

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
    const buffer = new THREE.InterleavedBuffer(
      classifications.values.slice(0, -classifications.dim),
      classifications.dim,
    )

    return {
      index: triangles,
      attributes: [
        { name: 'position', buffer: new THREE.Float32BufferAttribute(rays, 3) },
        { name: 'ball', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 0) },
        { name: 'goal', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 1) },
        { name: 'fieldLine', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 2) },
        { name: 'field', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 3) },
        { name: 'environment', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 4) },
      ],
    }
  })

  private readonly material = shaderMaterial(() => ({
    shader: VisualMeshViewModel.shader,
    uniforms: {
      Hcw: { value: this.params.Hcw.toThree() },
      viewSize: { value: new Vector2(this.canvas.width, this.canvas.height).toThree() },
      focalLength: { value: this.params.lens.focalLength },
      centre: { value: this.params.lens.centre.toThree() },
      k: { value: this.params.lens.distortionCoeffecients.toThree() },
      projection: { value: this.params.lens.projection },
    },
    depthTest: false,
    depthWrite: false,
    transparent: true,
  }))

  private static readonly shader = rawShader(() => ({ vertexShader, fragmentShader }))
}
