import { LinearMipMapLinearFilter } from 'three'
import { NearestFilter } from 'three'
import { InterleavedBuffer } from 'three'
import { RawShaderMaterial } from 'three'
import { BufferGeometry } from 'three'
import { PlaneGeometry } from 'three'
import { PointLight } from 'three'
import { AmbientLight } from 'three'
import { BoxGeometry } from 'three'
import { Camera } from 'three'
import { LinearFilter } from 'three'
import { ClampToEdgeWrapping } from 'three'
import { UnsignedByteType } from 'three'
import { RGBAFormat } from 'three'
import { MultiplyOperation } from 'three'
import { Combine } from 'three'
import { WebGLRenderTarget } from 'three'
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
  children?: Array<Object3D | false | undefined>,
  frustumCulled?: false
}

export type StageOpts = {
  scene: Scene,
  camera: Camera,
  target?: WebGLRenderTarget
}

export const stage = createUpdatableComputed(
  ({ scene, camera, target }: StageOpts) => ({ scene, camera, target }),
  (stage, opts) => {
    stage.scene = opts.scene
    stage.camera = opts.camera
    stage.target = opts.target
  },
)

export const scene = createUpdatableComputed(
  (opts: Object3DOpts) => new Scene(),
  (scene, opts) => {
    scene.remove(...scene.children)
    if (opts) {
      const children = opts.children && opts.children.filter(truthy)
      children && children.length && scene.add(...children)
      updateObject3D(scene, opts)
    }
  },
  scene => scene.dispose(),
)

export const group = createUpdatableComputed(
  (opts: Object3DOpts | undefined) => opts && new Object3D(),
  (group, opts) => {
    if (!group || !opts) {
      return
    }
    group.remove(...group.children)
    const children = opts.children && opts.children.filter(truthy)
    children && children.length && group.add(...children)
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
  geometry: Geometry | BufferGeometry,
  material: Material | Material[]
}

export const mesh = createUpdatableComputed(
  (opts: MeshOpts & Object3DOpts | undefined) => opts && new Mesh(opts.geometry, opts.material),
  (mesh, opts) => {
    if (!mesh || !opts) {
      return
    }
    mesh.geometry = opts.geometry
    mesh.material = opts.material
    updateObject3D(mesh, opts)
  },
)

type MaterialOpts = {
  depthTest?: boolean,
  depthWrite?: boolean,
  transparent?: boolean
}

type MeshBasicMaterialOpts = MaterialOpts & {
  color?: Color,
  map?: Texture,
  transparent?: boolean,
  combine?: Combine
}

const defaultColor = new Color(0xffffff)
const defaultCombine = MultiplyOperation
export const meshBasicMaterial = createUpdatableComputed(
  (opts: MeshBasicMaterialOpts) => new MeshBasicMaterial(),
  (material, opts) => {
    material.color = opts.color || defaultColor
    material.combine = opts.combine || defaultCombine
    material.map = opts.map || null
    material.transparent = opts.transparent != null ? opts.transparent : false
    material.needsUpdate = true
  },
  mesh => mesh.dispose(),
)

type MeshPhongMaterialOpts = MaterialOpts & {
  color?: Color,
  map?: Texture
}

export const meshPhongMaterial = createUpdatableComputed(
  (opts: MeshPhongMaterialOpts) => new MeshPhongMaterial(),
  (material, opts) => {
    material.color = opts.color || defaultColor
    material.map = opts.map || null
    updateMaterial(material, opts)
    material.needsUpdate = true
  },
  material => material.dispose(),
)

type ShaderOpts = {
  vertexShader: string
  fragmentShader: string
}

export const shader = createUpdatableComputed(
  (opts: ShaderOpts) => new ShaderMaterial(opts),
  (material, opts) => {
    material.vertexShader = opts.vertexShader
    material.fragmentShader = opts.fragmentShader
  },
  material => material.dispose(),
)

export const rawShader = createUpdatableComputed(
  (opts: ShaderOpts) => new RawShaderMaterial(opts),
  (material, opts) => {
    material.vertexShader = opts.vertexShader
    material.fragmentShader = opts.fragmentShader
  },
  material => material.dispose(),
)

type ShaderMaterialOpts = MaterialOpts & {
  shader(): ShaderMaterial | RawShaderMaterial;
  uniforms?: { [uniform: string]: { value: any } }
}

export const shaderMaterial = createUpdatableComputed(
  (opts: ShaderMaterialOpts) => opts.shader().clone(),
  (material, opts) => {
    if (opts.uniforms) {
      for (const key of Object.keys(opts.uniforms)) {
        material.uniforms[key] = opts.uniforms[key]
      }
    }
    updateMaterial(material, opts)
    material.needsUpdate = true
  },
)

function updateMaterial(object: Material, opts: MaterialOpts) {
  object.depthTest = opts.depthTest != null ? opts.depthTest : true
  object.depthWrite = opts.depthWrite != null ? opts.depthWrite : true
  object.transparent = opts.transparent != null ? opts.transparent : false
}

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
  data?: TypedArray,
  width: number,
  height: number,
  format?: PixelFormat,
  type?: TextureDataType,
  mapping?: Mapping,
  wrapS?: Wrapping,
  wrapT?: Wrapping,
  magFilter?: TextureFilter,
  minFilter?: TextureFilter,
  flipY?: boolean
}

export const dataTexture = createUpdatableComputed(
  (opts: DataTextureOpts | undefined) => opts && opts.data && new DataTexture(opts.data, opts.width, opts.height),
  (texture, opts) => {
    if (!texture || !opts || !opts.data) {
      return
    }
    texture.format = opts.format != null ? opts.format : RGBAFormat
    texture.type = opts.type != null ? opts.type : UnsignedByteType
    texture.mapping = opts.mapping != null ? opts.mapping : Texture.DEFAULT_MAPPING
    texture.wrapS = opts.wrapS != null ? opts.wrapS : ClampToEdgeWrapping
    texture.wrapT = opts.wrapT != null ? opts.wrapT : ClampToEdgeWrapping
    texture.magFilter = opts.magFilter != null ? opts.magFilter : NearestFilter
    texture.minFilter = opts.minFilter != null ? opts.minFilter : LinearMipMapLinearFilter
    texture.flipY = opts.flipY != null ? opts.flipY : false
    texture.needsUpdate = true
  },
  texture => texture && texture.dispose(),
)

type TextureOpts = {
  format?: PixelFormat,
  type?: TextureDataType,
  wrapS?: Wrapping,
  wrapT?: Wrapping,
  magFilter?: TextureFilter,
  minFilter?: TextureFilter
}

type ImageTextureOpts = TextureOpts & {
  image?: HTMLImageElement,
  mapping?: Mapping,
  flipY?: boolean
}

export const imageTexture = createUpdatableComputed(
  // Unlike other builders in this file, `image` is optional.
  // This is because images need to be loaded, so it is often the case the data will not exist immediately.
  // Making it optional turns out to be very convenient as uniform values (such as textures) can be set asynchronously.
  (opts: ImageTextureOpts) => opts.image && new Texture(),
  (texture, opts) => {
    if (texture) {
      texture.image = opts.image
      texture.flipY = opts.flipY != null ? opts.flipY : false
      texture.mapping = opts.mapping != null ? opts.mapping : Texture.DEFAULT_MAPPING
      updateTexture(texture, opts)
      texture.needsUpdate = true
    }
  },
  texture => texture && texture.dispose(),
)

type RenderTargetOpts = TextureOpts & {
  width: number,
  height: number,
  anisotropy?: number;
  depthBuffer?: boolean;
  stencilBuffer?: boolean;
}

export const renderTarget = createUpdatableComputed(
  (opts: RenderTargetOpts) => new WebGLRenderTarget(opts.width, opts.height),
  (renderTarget, opts) => {
    renderTarget.setSize(opts.width, opts.height)
    renderTarget.texture.anisotropy = opts.anisotropy != null ? opts.anisotropy : 1
    renderTarget.depthBuffer = opts.depthBuffer != null ? opts.depthBuffer : true
    renderTarget.stencilBuffer = opts.stencilBuffer != null ? opts.stencilBuffer : true
    updateTexture(renderTarget.texture, opts)
  },
  renderTarget => renderTarget.dispose(),
)

function updateTexture(texture: Texture, opts: TextureOpts) {
  texture.format = opts.format || RGBAFormat
  texture.type = opts.type || UnsignedByteType
  texture.wrapS = opts.wrapS || ClampToEdgeWrapping
  texture.wrapT = opts.wrapT || ClampToEdgeWrapping
  texture.magFilter = opts.magFilter || LinearFilter
  texture.minFilter = opts.minFilter || LinearFilter
}

type BoxGeometryOpts = { width: number, height: number, depth: number }

export const boxGeometry = createUpdatableComputed(
  (opts: BoxGeometryOpts) => new BoxGeometry(opts.width, opts.height, opts.depth),
  (geometry, opts) => {
    const { width, height, depth } = geometry.parameters
    if (opts.width !== width || opts.height !== height || opts.depth !== depth) {
      geometry.copy(new BoxGeometry(opts.width, opts.height, opts.depth))
    }
  },
  box => box.dispose(),
)

type PlaneGeometryOpts = { width: number, height: number }

export const planeGeometry = createUpdatableComputed(
  (opts: PlaneGeometryOpts) => new PlaneGeometry(opts.width, opts.height),
  (geometry, opts) => {
    const { width, height } = geometry.parameters
    if (opts.width !== width || opts.height !== height) {
      geometry.copy(new PlaneGeometry(opts.width, opts.height))
    }
  },
  plane => plane.dispose(),
)

type InterleavedBufferOpts = {
  buffer: TypedArray,
  stride: number
}

export const interleavedBuffer = createUpdatableComputed(
  (opts: InterleavedBufferOpts) => new InterleavedBuffer(opts.buffer, opts.stride),
  (buffer, opts) => {
    buffer.needsUpdate = true
  },
)

type LightOpts = Object3DOpts & { color?: Color, intensity?: number }

export const ambientLight = createUpdatableComputed(
  (opts: LightOpts) => new AmbientLight(opts.color, opts.intensity),
  (light, opts) => {
    light.color = opts.color != null ? opts.color : defaultColor
    light.intensity = opts.intensity != null ? opts.intensity : 1
    updateObject3D(light, opts)
  },
)

export const pointLight = createUpdatableComputed(
  (opts: LightOpts) => new PointLight(opts.color, opts.intensity),
  (light, opts) => {
    light.color = opts.color != null ? opts.color : defaultColor
    light.intensity = opts.intensity != null ? opts.intensity : 1
    updateObject3D(light, opts)
  },
)

function updateObject3D(object: Object3D, opts: Object3DOpts) {
  opts.position && object.position.set(opts.position.x, opts.position.y, opts.position.z)
  opts.rotation && object.rotation.set(opts.rotation.x, opts.rotation.y, opts.rotation.z, opts.rotationOrder)
  opts.scale && object.scale.set(opts.scale.x, opts.scale.y, opts.scale.z)
  opts.up && object.up.set(opts.up.x, opts.up.y, opts.up.z)
  object.frustumCulled = opts.frustumCulled != null ? opts.frustumCulled : true
}

function truthy<T>(t: T | undefined | null | false): t is T {
  return !!t
}
