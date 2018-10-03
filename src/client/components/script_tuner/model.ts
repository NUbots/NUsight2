import { computed } from 'mobx'
import { observable } from 'mobx'

import { RobotModel } from '../robot/model'

export class ScriptTunerModel {
  @observable private robotModels: RobotModel[]

  constructor(robotModels: RobotModel[]) {
    this.robotModels = robotModels
  }

  static of(robots: RobotModel[]): ScriptTunerModel {
    return new ScriptTunerModel(robots)
  }
}
