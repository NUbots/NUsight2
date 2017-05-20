import { observable } from 'mobx'

export class RobotModel {
  @observable public enabled: boolean
  @observable public name: string
  @observable public host: string

  public constructor(opts: RobotModel) {
    Object.assign(this, opts)
  }

  public static of(opts: { enabled?: boolean, name: string, host: string }) {
    const options = Object.assign({}, opts, { enabled: opts.enabled === undefined ? false : opts.enabled })
    return new RobotModel(options)
  }
}
