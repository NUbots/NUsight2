import { computed } from 'mobx'
import { observable } from 'mobx'

export class Vector4 {
  @observable public x: number
  @observable public y: number
  @observable public z: number
  @observable public t: number

  public constructor(x: number, y: number, z: number, t: number) {
    this.x = x
    this.y = y
    this.z = z
    this.t = t
  }

  public static of() {
    return new Vector4(0, 0, 0, 0)
  }

  public static from(vec?: { x?: number, y?: number, z?: number, t?: number } | null): Vector4 {
    if (!vec) {
      return Vector4.of()
    }
    return new Vector4(vec.x || 0, vec.y || 0, vec.z || 0, vec.t || 0)
  }

  @computed get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.t * this.t)
  }

  public set(x: number, y: number, z: number, t: number): Vector4 {
    this.x = x
    this.y = y
    this.z = z
    this.t = t
    return this
  }

  public clone(): Vector4 {
    return new Vector4(this.x, this.y, this.z, this.t)
  }

  public copy(v: Vector4): Vector4 {
    this.x = v.x
    this.y = v.y
    this.z = v.z
    this.t = v.t
    return this
  }

  public normalize(): Vector4 {
    return this.divideScalar(this.length)
  }

  public multiplyScalar(scalar: number): Vector4 {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar
    this.t *= scalar
    return this
  }

  public divideScalar(scalar: number): Vector4 {
    if (scalar !== 0) {
      const invScalar = 1 / scalar
      this.x *= invScalar
      this.y *= invScalar
      this.z *= invScalar
      this.t *= invScalar
    } else {
      this.x = 0
      this.y = 0
      this.z = 0
      this.t = 0
    }
    return this
  }

  public add(v: Vector4): Vector4 {
    this.x += v.x
    this.y += v.y
    this.z += v.z
    this.t += v.t
    return this
  }

  public subtract(v: Vector4): Vector4 {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z
    this.t -= v.t
    return this
  }
}
