import { action } from 'mobx'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { Transform } from './transform'

export class Vector2 {
  @observable public x: number
  @observable public y: number

  public constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public static of(x?: number, y?: number): Vector2 {
    return new Vector2(x || 0, y || 0)
  }

  public static from(vec?: { x?: number, y?: number } | null): Vector2 {
    if (!vec) {
      return Vector2.of()
    }
    return new Vector2(vec.x || 0, vec.y || 0)
  }

  @computed get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  @action
  public transform(transform: Transform): Vector2 {
    const { rotate, scale, translate } = transform

    const theta = rotate * (transform.anticlockwise ? 1 : -1)

    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)

    const rotationMatrix = [
      cosTheta, -sinTheta,
      sinTheta, cosTheta,
    ]

    const x = this.x
    const y = this.y

    this.x = scale.x * (x * rotationMatrix[0] + y * rotationMatrix[1]) + translate.x
    this.y = scale.y * (x * rotationMatrix[2] + y * rotationMatrix[3]) + translate.y

    return this
  }

  @action
  public set(x: number, y: number): Vector2 {
    this.x = x
    this.y = y
    return this
  }

  @action
  public clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  @action
  public copy(v: Vector2): Vector2 {
    this.x = v.x
    this.y = v.y
    return this
  }

  @action
  public normalize(): Vector2 {
    // We should not use the computed property 'length' as mobx can throw out the following error when called in a
    // computed context for what should be a new, unobserved vector: Computed values are not allowed to cause side
    // effects by changing observables that are already being observed.
    const length = Math.sqrt(this.x * this.x + this.y * this.y)
    return this.divideScalar(length)
  }

  @action
  public multiplyScalar(scalarX: number, scalarY: number = scalarX): Vector2 {
    this.x *= scalarX
    this.y *= scalarY
    return this
  }

  @action
  public divideScalar(scalarX: number, scalarY: number = scalarX): Vector2 {
    if (scalarX !== 0) {
      const invScalar = 1 / scalarX
      this.x *= invScalar
    } else {
      this.x = 0
    }

    if (scalarY !== 0) {
      const invScalar = 1 / scalarY
      this.y *= invScalar
    } else {
      this.y = 0
    }

    return this
  }

  @action
  public add(v: Vector2): Vector2 {
    this.x += v.x
    this.y += v.y
    return this
  }

  @action
  public subtract(v: Vector2): Vector2 {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  public dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y
  }
}
