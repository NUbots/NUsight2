import { observable } from 'mobx'

export class DarwinMotor {
  @observable public angle: number

  public constructor(opts: DarwinMotor) {
    Object.assign(this, opts)
  }

  public static of() {
    return new DarwinMotor({ angle: 0 })
  }
}
