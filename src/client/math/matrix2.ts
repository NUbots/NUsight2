import { action } from 'mobx'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { Vector2 } from './vector2'

export class Matrix2 {
  @observable public x: Vector2
  @observable public y: Vector2

  public constructor(x: Vector2, y: Vector2) {
    this.x = x
    this.y = y
  }

  public static of() {
    return new Matrix2(new Vector2(1, 0), new Vector2(0, 1))
  }

  public static from(mat?: {
    x?: { x?: number, y?: number },
    y?: { x?: number, y?: number }
  } | null): Matrix2 {
    if (!mat) {
      return Matrix2.of()
    }
    return new Matrix2(Vector2.from(mat.x), Vector2.from(mat.y))
  }

  @computed get trace(): number {
    return this.x.x + this.y.y
  }

  @action
  public set(x: Vector2, y: Vector2): Matrix2 {
    this.x = x
    this.y = y
    return this
  }

  @action
  public clone(): Matrix2 {
    return new Matrix2(this.x.clone(), this.y.clone())
  }

  @action
  public copy(m: Matrix2): Matrix2 {
    this.x = m.x
    this.y = m.y
    return this
  }

  @action
  public multiplyScalar(scalar: number): Matrix2 {
    this.x.multiplyScalar(scalar)
    this.y.multiplyScalar(scalar)
    return this
  }

  @action
  public divideScalar(scalar: number): Matrix2 {
    this.x.divideScalar(scalar)
    this.y.divideScalar(scalar)
    return this
  }
}
