import { RobotModel } from '../robot/model'
import { VisionRobotModel } from './model'
import { VisionModel } from './model'

export class VisionController {
  static of() {
    return new VisionController()
  }

  onSelectRobot(model: VisionModel, robot?: RobotModel) {
    model.selectedRobot = robot && VisionRobotModel.of(robot)
  }
}
