import { action, observable } from 'mobx'
import { computed } from 'mobx'
import { RobotModel } from './darwin_robot/model'
import { FieldModel } from './field/model'

export class TimeModel {
  @observable public time: number // seconds
  @observable public lastRenderTime: number // seconds

  constructor(opts: Partial<TimeModel>) {
    Object.assign(this, opts)
  }

  public static of() {
    return new TimeModel({
      time: 0,
      lastRenderTime: 0,
    })
  }

  @computed get timeSinceLastRender() {
    return this.time - this.lastRenderTime
  }
}

export enum ViewMode {
  NO_CLIP,
  FIRST_PERSON,
  THIRD_PERSON,
}

export class LocalisationModel {
  @observable public aspect: number
  @observable public robots: RobotModel[]
  @observable public field: FieldModel
  @observable public camera: CameraModel
  @observable public locked: boolean
  @observable public controls: ControlsModel
  @observable public viewMode: ViewMode
  @observable public target: RobotModel | null
  @observable public time: TimeModel

  constructor(opts: LocalisationModel) {
    Object.assign(this, opts)
  }

  public static of(): LocalisationModel {
    return new LocalisationModel({
      aspect: 300 / 150,
      robots: [],
      field: FieldModel.of(),
      camera: CameraModel.of(),
      locked: false,
      controls: ControlsModel.of(),
      viewMode: ViewMode.NO_CLIP,
      target: null,
      time: TimeModel.of(),
    })
  }
}

class CameraModel {
  @observable public position: Vector3
  @observable public yaw: number
  @observable public pitch: number
  @observable public distance: number

  constructor(opts: CameraModel) {
    Object.assign(this, opts)
  }

  public static of() {
    return new CameraModel({
      position: Vector3.of(),
      yaw: 0,
      pitch: 0,
      distance: 0.5,
    })
  }
}

export class ControlsModel {
  @observable public forward: boolean
  @observable public left: boolean
  @observable public right: boolean
  @observable public back: boolean
  @observable public up: boolean
  @observable public down: boolean
  @observable public pitch: number
  @observable public yaw: number

  constructor(opts: ControlsModel) {
    Object.assign(this, opts)
  }

  public static of() {
    return new ControlsModel({
      forward: false,
      left: false,
      right: false,
      back: false,
      up: false,
      down: false,
      pitch: 0,
      yaw: 0,
    })
  }
}

export class Vector3 {
  @observable public x: number
  @observable public y: number
  @observable public z: number

  public constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  public static of() {
    return new Vector3(0, 0, 0)
  }

  @computed get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  @action
  public set(x: number, y: number, z: number): Vector3 {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  @action
  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z)
  }

  @action
  public copy(v: Vector3): Vector3 {
    this.x = v.x
    this.y = v.y
    this.z = v.z
    return this
  }

  @action
  public normalize(): Vector3 {
    return this.divideScalar(this.length)
  }

  @action
  public multiplyScalar(scalar: number): Vector3 {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar
    return this
  }

  @action
  public divideScalar(scalar: number): Vector3 {
    if (scalar !== 0) {
      const invScalar = 1 / scalar
      this.x *= invScalar
      this.y *= invScalar
      this.z *= invScalar
    } else {
      this.x = 0
      this.y = 0
      this.z = 0
    }
    return this
  }

  @action
  public add(movement: Vector3): Vector3 {
    this.x += movement.x
    this.y += movement.y
    this.z += movement.z
    return this
  }
}
