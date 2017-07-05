import { action } from 'mobx'
import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { RobotPickerModel, Robot } from './model'

export class RobotPickerController {
  private model: RobotPickerModel
  private network: Network

  constructor(model: RobotPickerModel, network: Network ) {
    this.model = model
    this.network = network

    this.network.on('nuclear_join', this.addRobot)
    this.network.on('nuclear_leave', this.removeRobot)
  }

  public destroy(): void {
    this.network.off()
  }

  @action
  public addRobot(robot: Robot) {
    this.model.robots.push(robot)
  }

  @action
  public removeRobot(robotToRemove: Robot) {
    this.model.robots = this.model.robots.filter(robot => robot.name !== robotToRemove.name)
  }
}
