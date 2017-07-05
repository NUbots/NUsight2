import { observable } from 'mobx'

export interface Robot {
  name: string
  address: string
  port: number
}

export class RobotPickerModel {
  @observable
  public robots: Robot[]

  constructor(opts: { robots?: Robot[] }) {
    this.robots = opts.robots || []
  }
}
