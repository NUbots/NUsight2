import { observable } from 'mobx'
import { Vector3 } from '../../../math/vector3'

export class ConfidenceEllipseModel {
  @observable public color: string
  @observable public opacity: number
  @observable public position: Vector3
  @observable public scaleX: number
  @observable public scaleY: number
  @observable public rotationAxis: Vector3
  @observable public rotationAngle: number

  public constructor(opts: Partial<ConfidenceEllipseModel>) {
    Object.assign(this, opts)
  }

  public static of({
    color = '#0000ff',
    opacity = 0.5,
    position = new Vector3(0, 0, 0.001123),
    scaleX = 1,
    scaleY = 1,
    rotationAxis = new Vector3(0, 0, 1),
    rotationAngle = 0,
  }: ConfidenceEllipseModelOpts = {}): ConfidenceEllipseModel {
    return new ConfidenceEllipseModel({
      color,
      opacity,
      position,
      scaleX,
      scaleY,
      rotationAxis,
      rotationAngle,
    })
  }
}

interface ConfidenceEllipseModelOpts {
  color?: string
  opacity?: number
  position?: Vector3
  scaleX?: number
  scaleY?: number
  rotationAxis?: Vector3
  rotationAngle?: number
}
