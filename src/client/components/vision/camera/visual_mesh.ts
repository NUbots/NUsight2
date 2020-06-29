import { computed } from 'mobx'
import * as THREE from 'three'
import { Matrix4 } from '../../../math/matrix4'
import { Vector2 } from '../../../math/vector2'
import { Vector3 } from '../../../math/vector3'
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
      new Float32Array(classifications.values.slice(0, -classifications.dim)),
      classifications.dim,
    )

    return {
      index: triangles,
      attributes: [
        { name: 'position', buffer: new THREE.Float32BufferAttribute(this.rays, 3) },
        { name: 'ball', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 0) },
        { name: 'goal', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 1) },
        { name: 'fieldLine', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 2) },
        { name: 'field', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 3) },
        { name: 'environment', buffer: new THREE.InterleavedBufferAttribute(buffer, 1, 4) },
      ],
    }
  })

  @computed
  private get rays() {
    // This method transforms the rays such that they track correctly with the latest camera image.
    //
    // e.g. If we have a 5 second old visual mesh measurement, and receive a new camera image, the image may have
    // shifted perspective, and the visual mesh would look incorrectly offset on screen.
    //
    // We transform the rays by using the Hcw from the visual mesh measurement and the Hcw from the camera image
    // measurement. We firstly project the rays down to the ground using the height from the visual mesh Hcw
    // We then transform the ground points into world space by adding the translation to that camera.
    // Once we have ground points in the world space, we use any Hcw matrix to transform them to that camera's view.
    // This effectively remaps the rays to the perspective of the new camera image.

    const { rays: raysArray, Hcw: visualMeshHcw } = this.visualMesh
    const imageHcw = this.params.Hcw
    const visualMeshHwc = Matrix4.fromThree(new THREE.Matrix4().getInverse(visualMeshHcw.toThree()))
    const rCWw = visualMeshHwc.t.vec3()
    const rays = new Array<number>(raysArray.length)
    for (let i = 0; i < raysArray.length; i += 3) {
      const ray = new Vector3(raysArray[i], raysArray[i + 1], raysArray[i + 2])
      const newRay = ray
        .toThree() // rUCw
        // Project world space unit vector onto the world/field ground, giving us a camera to field vector in world space.
        .multiplyScalar(ray.z !== 0 ? -visualMeshHwc.t.z / ray.z : 1) // rFCw
        // Get the world to field vector, so that we can...
        .add(rCWw.toThree()) // rFWw = rFCw + rCWw
        // ...apply the camera image's world to camera transform, giving us a corrected camera space vector.
        .applyMatrix4(imageHcw.toThree()) // rFCc
        // Normalize to get the final camera space direction vector/ray.
        .normalize() // rUCc
      rays[i + 0] = newRay.x
      rays[i + 1] = newRay.y
      rays[i + 2] = newRay.z
    }
    return rays
  }

  private readonly material = shaderMaterial(() => ({
    shader: VisualMeshViewModel.shader,
    uniforms: {
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
