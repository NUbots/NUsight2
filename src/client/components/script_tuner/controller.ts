import { action, autorun, IReactionDisposer } from 'mobx'

import { RobotModel } from '../robot/model'

import { Script, ScriptTunerModel } from './model'
import { ScriptTunerNetwork } from './network'

interface ScriptTunerOpts {
  network: ScriptTunerNetwork
  model: ScriptTunerModel
}

export class ScriptTunerController {
  network: ScriptTunerNetwork
  model: ScriptTunerModel
  stopPlaytimeAutorun?: IReactionDisposer

  constructor(opts: ScriptTunerOpts) {
    this.network = opts.network
    this.model = opts.model

    this.stopPlaytimeAutorun = autorun(() => {
      if (this.model.playTime >= this.model.endTime) {
        this.togglePlayback(false)
      }
    })

    // TODO need to add an autorunner that if we are connected to the robot we need to send it update packets
  }

  static of(opts: ScriptTunerOpts) {
    return new ScriptTunerController(opts)
  }

  @action
  selectRobot(robot: RobotModel) {
    const isInitialSelect = this.model.selectedRobot === undefined
    this.model.selectedRobot = robot

    if (isInitialSelect) {
      this.network.requestScripts(robot)
    }
  }

  @action
  selectScript(script: Script) {
    this.model.selectedScript = script
  }

  @action
  setPlayTime(time: number) {
    this.model.currentTime = Math.min(Math.max(time, this.model.startTime), this.model.endTime)
    this.model.playStartedAt = Date.now()
  }

  @action
  togglePlayback(isPlaying: boolean = !this.model.isPlaying) {
    if (isPlaying) {
      this.model.playStartedAt = Date.now()
    } else {
      this.model.currentTime = this.model.playTime
    }

    this.model.isPlaying = isPlaying
  }
}
