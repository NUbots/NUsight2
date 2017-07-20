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

  public static from(vec2?: { x?: number, y?: number } | null): Vector2 {
    if (!vec2) {
      vec2 = { x: 0, y: 0 }
    }
    return new Vector2(vec2.x || 0, vec2.y || 0)
  }

  @computed get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  @action
  public applyTransform(transform: Transform): Vector2 {
    const { rotate: theta, scale, translate } = transform
    const rotationMatrix = [
      Math.cos(theta), -Math.sin(theta),
      Math.sin(theta), Math.cos(theta)
    ]

    const x = this.x
    const y = this.y

    this.x = scale * (x * rotationMatrix[0] + y * rotationMatrix[1]) + translate.x
    this.y = scale * (x * rotationMatrix[2] + y * rotationMatrix[3]) + translate.y

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
    return this.divideScalar(this.length)
  }

  @action
  public multiplyScalar(scalar: number): Vector2 {
    this.x *= scalar
    this.y *= scalar
    return this
  }

  @action
  public divideScalar(scalar: number): Vector2 {
    if (scalar !== 0) {
      const invScalar = 1 / scalar
      this.x *= invScalar
      this.y *= invScalar
    } else {
      this.x = 0
      this.y = 0
    }
    return this
  }

  @action
  public add(movement: Vector2): Vector2 {
    this.x += movement.x
    this.y += movement.y
    return this
  }
}

