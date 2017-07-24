import { observable } from 'mobx'
import { Vector3 } from '../../../math/vector3'

export class BallModel {
  @observable public name: string
  @observable public position: Vector3
  @observable public radius: number
  @observable public color: string

  public constructor(name: string, position: Vector3, radius: number, color: string) {
    this.name = name
    this.position = position
    this.radius = radius
    this.color = color
  }

  public static of({
    name = 'Ball',
    position = Vector3.of(),
    radius = 0.0335,
    color = '#FFCC00',
  }: BallModelOpts = {}): BallModel {
    return new BallModel(name, position, radius, color)
  }
}

interface BallModelOpts {
  name?: string
  position?: Vector3
  radius?: number
  color?: string
}
