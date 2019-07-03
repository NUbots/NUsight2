import { Texture } from 'three'
import { OrthographicCamera } from 'three'
import { PixelFormat } from 'three'
import { PerspectiveCamera } from 'three'
import { Scene } from 'three'
import { Geometry } from 'three'
import { TextureFilter } from 'three'
import { Wrapping } from 'three'
import { Mapping } from 'three'
import { TextureDataType } from 'three'
import * as THREE from 'three'
import { DataTexture } from 'three'
import { MeshPhongMaterial } from 'three'
import { MeshBasicMaterial } from 'three'
import { Color } from 'three'
import { Object3D } from 'three'
import { Mesh } from 'three'
import { Material } from 'three'
import { ShaderMaterial } from 'three'

import { Vector3 } from '../../math/vector3'

import { createUpdatableComputed } from './create_updatable_computed'

type Object3DOpts = {
  position?: Vector3,
  rotation?: Vector3,
  rotationOrder?: string,
  scale?: Vector3,
  up?: Vector3,
  children?: Object3D[]
}

export const scene = createUpdatableComputed(
  (opts: Object3DOpts) => new Scene(),
  (scene, opts) => {
    scene.remove(...scene.children)
    opts.children && scene.add(...opts.children)
    updateObject3D(scene, opts)
  },
)

export const group = createUpdatableComputed(
  (opts: Object3DOpts) => new Object3D(),
  (scene, opts) => {
    scene.remove(...scene.children)
    opts.children && scene.add(...opts.children)
    updateObject3D(scene, opts)
  },
)

type PerspectiveCameraOpts = {
  fov: number,
  aspect: number,
  near: number,
  far: number,
  lookAt?: Vector3
}

export const perspectiveCamera = createUpdatableComputed(
  (opts: PerspectiveCameraOpts & Object3DOpts) => new PerspectiveCamera(),
  (camera, opts) => {
    camera.fov = opts.fov
    camera.aspect = opts.aspect
    camera.near = opts.near
    camera.far = opts.far
    camera.updateProjectionMatrix()
    updateObject3D(camera, opts)
    opts.lookAt && camera.lookAt(new THREE.Vector3(opts.lookAt.x, opts.lookAt.y, opts.lookAt.z))
  },
)

type OrthographicCameraOpts = {
  left: number,
  right: number,
  top: number,
  bottom: number,
  near: number,
  far: number
}

export const orthographicCamera = createUpdatableComputed(
  (opts: OrthographicCameraOpts & Object3DOpts) => new OrthographicCamera(opts.left, opts.right, opts.top, opts.bottom),
  (camera, opts) => {
    camera.left = opts.left
    camera.right = opts.right
    camera.top = opts.top
    camera.bottom = opts.bottom
    camera.near = opts.near
    camera.far = opts.far
    camera.updateProjectionMatrix()
    updateObject3D(camera, opts)
  },
)

type MeshOpts = {
  geometry: Geometry,
  material: Material | Material[],
}

export const mesh = createUpdatableComputed(
  (opts: MeshOpts & Object3DOpts) => new Mesh(opts.geometry, opts.material),
  (mesh, opts) => {
    mesh.geometry = opts.geometry
    mesh.material = opts.material
    updateObject3D(mesh, opts)
  },
)

type MeshBasicMaterialOpts = {
  color: Color,
  polygonOffset?: boolean,
  polygonOffsetFactor?: number,
  polygonOffsetUnits?: number,
}

export const meshBasicMaterial = createUpdatableComputed(
  (opts: MeshBasicMaterialOpts) => new MeshBasicMaterial(),
  (mesh, opts) => {
    mesh.color = opts.color
    mesh.polygonOffset = opts.polygonOffset != null ? opts.polygonOffset : false
    mesh.polygonOffsetFactor = opts.polygonOffsetFactor != null ? opts.polygonOffsetFactor : 0
    mesh.polygonOffsetUnits = opts.polygonOffsetUnits != null ? opts.polygonOffsetUnits : 0
    mesh.needsUpdate = true
  },
  mesh => mesh.dispose(),
)

type MeshPhongMaterialOpts = {
  color: Color
}

export const meshPhongMaterial = createUpdatableComputed(
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

export const shaderMaterial = createUpdatableComputed(
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
  = Int8Array
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

export const dataTexture = createUpdatableComputed(
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

type ImageTextureOpts = {
  image?: HTMLImageElement
  format: PixelFormat,
  type: TextureDataType,
  mapping: Mapping,
  wrapS: Wrapping,
  wrapT: Wrapping,
  magFilter: TextureFilter,
  minFilter: TextureFilter,
  flipY: boolean
}

export const imageTexture = createUpdatableComputed(
  // Unlike other builders in this file, `image` is optional.
  // This is because images need to be loaded, so it is often the case the data will not exist immediately.
  // Making it optional turns out to be very convenient as uniform values (such as textures) can be set asynchronously.
  (opts: ImageTextureOpts) => opts.image && new Texture(),
  (texture, opts) => {
    if (texture) {
      texture.image = opts.image
      texture.format = opts.format
      texture.type = opts.type
      texture.mapping = opts.mapping
      texture.wrapS = opts.wrapS
      texture.wrapT = opts.wrapT
      texture.magFilter = opts.magFilter
      texture.minFilter = opts.minFilter
      texture.flipY = opts.flipY
      texture.needsUpdate = true
    }
  },
  texture => texture && texture.dispose(),
)

function updateObject3D(object: Object3D, opts: Object3DOpts) {
  opts.position && object.position.set(opts.position.x, opts.position.y, opts.position.z)
  opts.rotation && object.rotation.set(opts.rotation.x, opts.rotation.y, opts.rotation.z, opts.rotationOrder)
  opts.scale && object.scale.set(opts.scale.x, opts.scale.y, opts.scale.z)
  opts.up && object.up.set(opts.up.x, opts.up.y, opts.up.z)
}

