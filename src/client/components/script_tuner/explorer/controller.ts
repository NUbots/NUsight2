import { action, computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { RobotModel } from '../../robot/model'
import { ScriptTunerController } from '../controller'
import { Script } from '../model'

interface ExplorerControllerOpts {
  controller: ScriptTunerController
}

export class ExplorerController {
  controller: ScriptTunerController

  constructor(opts: ExplorerControllerOpts) {
    this.controller = opts.controller
  }

  static of = createTransformer((opts: ExplorerControllerOpts) => {
    return new ExplorerController(opts)
  })

  selectSourceRobot = (robot: RobotModel) => {
    this.controller.selectSourceRobot(robot)
  }

  selectTargetRobot = (robot: RobotModel) => {
    this.controller.selectTargetRobot(robot)
  }

  selectScript = (script: Script) => {
    this.controller.selectScript(script)
  }

  saveScript = () => {
    this.controller.saveScript()
  }
}
