import { action } from 'mobx'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { Vector3 } from './vector3'

export class Matrix3 {
  @observable public x: Vector3
  @observable public y: Vector3
  @observable public z: Vector3

  public constructor(x: Vector3, y: Vector3, z: Vector3) {
    this.x = x
    this.y = y
    this.z = z
  }

  public static of() {
    return new Matrix3(new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1))
  }

  public static from(mat?: {
    x?: { x?: number, y?: number, z? :number },
    y?: { x?: number, y?: number, z? :number },
    z?: { x?: number, y?: number, z? :number }
  } | null): Matrix3 {
    if (!mat) {
      mat = { x: { x:0, y:0, z:0 }, y: { x:0, y:0, z:0 }, z: { x:0, y:0, z:0 } }
    }
    return new Matrix3(Vector3.from(mat.x), Vector3.from(mat.y), Vector3.from(mat.z))
  }

  @computed get trace(): number {
    return this.x.x + this.y.y + this.z.z
  }

  @action
  public set(x: Vector3, y: Vector3, z: Vector3): Matrix3 {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  @action
  public clone(): Matrix3 {
    return new Matrix3(this.x.clone(), this.y.clone(), this.z.clone())
  }

  @action
  public copy(m: Matrix3): Matrix3 {
    this.x = m.x
    this.y = m.y
    this.z = m.z
    return this
  }

  @action
  public multiplyScalar(scalar: number): Matrix3 {
    this.x.multiplyScalar(scalar)
    this.y.multiplyScalar(scalar)
    this.z.multiplyScalar(scalar)
    return this
  }

  @action
  public divideScalar(scalar: number): Matrix3 {
    this.x.divideScalar(scalar)
    this.y.divideScalar(scalar)
    this.z.divideScalar(scalar)
    return this
  }

  @action
  public add(movement: Matrix3): Matrix3 {
    this.x.add(movement.x)
    this.y.add(movement.y)
    this.z.add(movement.z)
    return this
  }

  @action
  public subtract(movement: Matrix3): Matrix3 {
    this.x.subtract(movement.x)
    this.y.subtract(movement.y)
    this.z.subtract(movement.z)
    return this
  }
}
