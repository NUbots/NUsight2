import { action } from 'mobx'
import { RobotModel } from '../robot/model'

export class AppController {

  public static of() {
    return new AppController()
  }

  @action
  public toggleRobot(model: RobotModel) {
    model.enabled = !model.enabled
  }

}
