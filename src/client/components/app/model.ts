import { observable } from 'mobx'
import { RobotModel } from '../robot/model'

export class AppModel {
  @observable public robots: RobotModel[]

  constructor(opts: AppModel) {
    Object.assign(this, opts)
  }

  public static create(options: { robots: RobotModel[] } = { robots: [] }) {
    return new AppModel(options)
  }
}
