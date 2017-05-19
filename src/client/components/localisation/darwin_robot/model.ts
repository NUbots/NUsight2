import { observable } from 'mobx'
import { Vector3 } from '../model/vector'
import { DarwinMotorSet } from './model/darwin_motor_set'

export class RobotModel {
  @observable public id: number
  @observable public name: string
  @observable public color: string
  @observable public heading: number
  @observable public position: Vector3
  @observable public motors: DarwinMotorSet

  public constructor(opts: RobotModel) {
    Object.assign(this, opts)
  }

  public static of(opts: { id: number, name: string, color: string, heading: number}) {
    return new RobotModel({
      ...opts,
      position: Vector3.of(),
      motors: DarwinMotorSet.of(),
    })
  }
}
