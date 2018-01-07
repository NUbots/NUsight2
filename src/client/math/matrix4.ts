import { computed } from 'mobx'
import { observable } from 'mobx'
import { Vector4 } from './vector4'

export class Matrix4 {
  @observable public x: Vector4
  @observable public y: Vector4
  @observable public z: Vector4
  @observable public t: Vector4

  public constructor(x: Vector4, y: Vector4, z: Vector4, t: Vector4) {
    this.x = x
    this.y = y
    this.z = z
    this.t = t
  }

  public static of() {
    return new Matrix4(
      new Vector4(1, 0, 0, 0),
      new Vector4(0, 1, 0, 0),
      new Vector4(0, 0, 1, 0),
      new Vector4(0, 0, 0, 1),
    )
  }

  public static from(mat?: {
    x?: { x?: number, y?: number, z?: number, t?: number },
    y?: { x?: number, y?: number, z?: number, t?: number },
    z?: { x?: number, y?: number, z?: number, t?: number },
    t?: { x?: number, y?: number, z?: number, t?: number }
  } | null): Matrix4 {
    if (!mat) {
      return Matrix4.of()
    }
    return new Matrix4(Vector4.from(mat.x), Vector4.from(mat.y), Vector4.from(mat.z), Vector4.from(mat.t))
  }

  @computed
  get trace(): number {
    return this.x.x + this.y.y + this.z.z + this.t.t
  }

  public set(x: Vector4, y: Vector4, z: Vector4, t: Vector4): Matrix4 {
    this.x = x
    this.y = y
    this.z = z
    this.t = t
    return this
  }

  public clone(): Matrix4 {
    return new Matrix4(this.x.clone(), this.y.clone(), this.z.clone(), this.t.clone())
  }

  public copy(m: Matrix4): Matrix4 {
    this.x.copy(m.x)
    this.y.copy(m.y)
    this.z.copy(m.z)
    this.t.copy(m.t)
    return this
  }
}
