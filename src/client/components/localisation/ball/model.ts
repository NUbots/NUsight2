import { observable } from 'mobx'
import { Vector3 } from '../../../math/vector3'

interface BallConfidenceEllipse {
  color: string
  opacity: number
  position: Vector3
  scaleX: number
  scaleY: number
  rotationAxis: Vector3
  rotationAngle: number
}

export class BallModel {
  @observable public name: string
  @observable public position: Vector3
  @observable public radius: number
  @observable public color: string
  @observable public confidenceEllipse: BallConfidenceEllipse

  public constructor(name: string, position: Vector3, radius: number, color: string) {
    this.name = name
    this.position = position
    this.radius = radius
    this.color = color

    this.confidenceEllipse = {
      color: '#0000ff',
      opacity: 0.5,
      position: new Vector3(0, 0, 0.001123),
      scaleX: 1,
      scaleY: 1,
      rotationAxis: new Vector3(0, 0, 1),
      rotationAngle: 0,
    }
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
