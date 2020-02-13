import { observable } from 'mobx'

import { Matrix4 } from '../../../math/matrix4'
import { Vector2 } from '../../../math/vector2'
import { Vector3 } from '../../../math/vector3'
import { Vector4 } from '../../../math/vector4'

type ImageData
  = { readonly type: 'element', readonly element: HTMLImageElement, readonly format: number }
  | { readonly type: 'data', readonly data: Uint8Array, readonly format: number }

export interface Image {
  readonly width: number
  readonly height: number
  readonly image: ImageData
}

export interface GreenHorizon {
  readonly horizon: Vector3[]
  readonly Hcw: Matrix4
}

export interface VisualMesh {
  readonly neighbours: number[]
  readonly rays: number[]
  readonly classifications: { dim: number, values: number[] }
}

export interface CameraLens {
  readonly projection: number
  readonly focalLength: number
  readonly centre: Vector2
}

export interface VisionImage extends Image {
  readonly Hcw: Matrix4
  readonly lens: CameraLens
}

export interface Cone {
  readonly axis: Vector3
  readonly radius: number
}

export interface Ball {
  readonly timestamp: number
  readonly Hcw: Matrix4
  readonly cone: Cone
  readonly distance: number
  readonly colour: Vector4
}

export interface Goal {
  readonly timestamp: number
  readonly Hcw: Matrix4
  readonly side: 'left' | 'right' | 'unknown'
  readonly post: {
    readonly top: Vector3
    readonly bottom: Vector3
    readonly distance: number
  }
}

export class CameraModel {
  readonly id: number

  @observable.ref greenhorizon?: GreenHorizon
  @observable.ref visualmesh?: VisualMesh
  @observable.ref image?: VisionImage
  @observable.ref balls: Ball[]
  @observable.ref goals: Goal[]
  @observable.ref name: string
  @observable.shallow draw = {
    image: true,
    compass: true,
    horizon: true,
    visualmesh: true,
    greenhorizon: true,
    balls: true,
    goals: true,
  }

  constructor({ id, name, balls, goals }: {
    id: number
    name: string
    balls: Ball[]
    goals: Goal[]
  }) {
    this.id = id
    this.name = name
    this.balls = balls
    this.goals = goals
  }

  static of({ id, name }: { id: number, name: string }) {
    return new CameraModel({ id, name, balls: [], goals: [] })
  }
}
