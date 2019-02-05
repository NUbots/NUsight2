import { onBecomeUnobserved } from 'mobx'
import { IComputedValue } from 'mobx'
import { computed } from 'mobx'
import { PerspectiveCamera } from 'three'
import * as THREE from 'three'
import { Scene } from 'three'
import { Geometry } from 'three'
import { TextureFilter } from 'three'
import { Wrapping } from 'three'
import { Mapping } from 'three'
import { TextureDataType } from 'three'
import { PixelFormat } from 'three'
import { DataTexture } from 'three'
import { MeshPhongMaterial } from 'three'
import { MeshBasicMaterial } from 'three'
import { Color } from 'three'
import { Object3D } from 'three'
import { Mesh } from 'three'
import { Material } from 'three'
import { ShaderMaterial } from 'three'

import { Vector3 } from '../../math/vector3'

export const updatableComputed = <T, O>(
  create: (opts: O) => T,
  update: (instance: T, opts: O) => void,
  dispose?: (instance: T) => void,
) => (getOpts: () => O): IComputedValue<T> => {
  let instance: T | undefined
  const expr = computed(() => {
    const opts = getOpts()
    if (instance == null) {
      instance = create(opts)
    }
    update(instance, opts)
    return instance
  }, { equals: () => false })
  onBecomeUnobserved(expr, () => {
    dispose && instance && dispose(instance)
    instance = undefined
  })
  return expr
}

type Object3DOpts = {
  position?: Vector3,
  rotation?: Vector3,
  rotationOrder?: string,
  scale?: Vector3,
  up?: Vector3,
  children?: Object3D[]
}

function updateObject3D(object: Object3D, opts: Object3DOpts) {
  opts.position && object.position.set(opts.position.x, opts.position.y, opts.position.z)
  opts.rotation && object.rotation.set(opts.rotation.x, opts.rotation.y, opts.rotation.z, opts.rotationOrder)
  opts.scale && object.scale.set(opts.scale.x, opts.scale.y, opts.scale.z)
  opts.up && object.up.set(opts.up.x, opts.up.y, opts.up.z)
}

export const scene = updatableComputed(
  (opts: Object3DOpts) => new Scene(),
  (scene, opts) => {
    scene.remove(...scene.children)
    opts.children && scene.add(...opts.children)
    updateObject3D(scene, opts)
  },
)

export const group = updatableComputed(
  (opts: Object3DOpts) => new Object3D(),
  (group, opts) => {
    group.remove(...group.children)
    opts.children && group.add(...opts.children)
    updateObject3D(group, opts)
  },
)

type PerspectiveCameraOpts = {
  fov: number,
  aspect: number,
  near: number,
  far: number,
  lookAt?: Vector3
}

export const perspectiveCamera = updatableComputed(
  (opts: PerspectiveCameraOpts & Object3DOpts) => new PerspectiveCamera(),
  (camera, opts) => {
    camera.fov = opts.fov
    camera.aspect = opts.aspect
    camera.near = opts.near
    camera.far = opts.far
    camera.updateProjectionMatrix()
    opts.lookAt && camera.lookAt(new THREE.Vector3(opts.lookAt.x, opts.lookAt.y, opts.lookAt.z))
    updateObject3D(camera, opts)
  },
)

type MeshOpts = {
  geometry: Geometry,
  material: Material | Material[]
}

export const mesh = updatableComputed(
  (opts: MeshOpts & Object3DOpts) => new Mesh(opts.geometry, opts.material),
  (mesh, opts) => {
    mesh.geometry = opts.geometry
    mesh.material = opts.material
    updateObject3D(mesh, opts)
  },
)

type MeshBasicMaterialOpts = {
  color: Color
}

export const meshBasicMaterial = updatableComputed(
  (opts: MeshBasicMaterialOpts) => new MeshBasicMaterial(),
  (mesh, opts) => {
    mesh.color = opts.color
  },
  mesh => mesh.dispose(),
)

type MeshPhongMaterialOpts = {
  color: Color
}

export const meshPhongMaterial = updatableComputed(
  (opts: MeshPhongMaterialOpts) => new MeshPhongMaterial(),
  (material, opts) => {
    material.color = opts.color
  },
  material => material.dispose(),
)

type ShaderMaterialOpts = {
  vertexShader: string
  fragmentShader: string
  uniforms: { [uniform: string]: { value: any } }
}

export const shaderMaterial = updatableComputed(
  (opts: ShaderMaterialOpts) => new ShaderMaterial(opts),
  (material, opts) => {
    material.vertexShader = opts.vertexShader
    material.fragmentShader = opts.fragmentShader
    for (const key of Object.keys(opts.uniforms)) {
      material.uniforms[key] = opts.uniforms[key]
    }
    material.needsUpdate = true
  },
  material => material.dispose(),
)

type TypedArray
  = ArrayBuffer
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

type DataTextureOpts = {
  data: TypedArray,
  width: number,
  height: number,
  format: PixelFormat,
  type: TextureDataType,
  mapping: Mapping,
  wrapS: Wrapping,
  wrapT: Wrapping,
  magFilter: TextureFilter,
  minFilter: TextureFilter,
  flipY: boolean
}

export const dataTexture = updatableComputed(
  (opts: DataTextureOpts) => new DataTexture(opts.data, opts.width, opts.height),
  (texture, opts) => {
    texture.format = opts.format
    texture.type = opts.type
    texture.mapping = opts.mapping
    texture.wrapS = opts.wrapS
    texture.wrapT = opts.wrapT
    texture.magFilter = opts.magFilter
    texture.minFilter = opts.minFilter
    texture.flipY = opts.flipY
    texture.needsUpdate = true
  },
  texture => texture.dispose(),
)
