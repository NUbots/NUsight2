import { action } from 'mobx'
import { RobotModel } from '../robot/model'

export class AppController {
  public static create() {
    return new AppController()
  }

  @action
  public toggleRobotEnabled(model: RobotModel) {
    model.enabled = !model.enabled
  }
}
