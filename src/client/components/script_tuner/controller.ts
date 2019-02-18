import { action, autorun, IReactionDisposer } from 'mobx'
import { createViewModel, deepObserve } from 'mobx-utils'

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
    // Reset the editor state
    this.model.isPlaying = false
    this.model.currentTime = 0
    this.model.previousTimelineLength = 0

    // Prompt to save or reset the current script if there are changes
    if (this.model.selectedScript && this.model.selectedScript.isDirty) {
      const save = confirm(`Save changes to ${this.model.selectedScript.path}?`)

      if (save) {
        this.model.selectedScript.submit()
        this.network.saveScript(this.model.selectedScript.model)
      } else {
        this.model.selectedScript.reset()
      }
    }

    // Select the script
    this.model.selectedScript = createViewModel(script)
  }

  @action
  setPlayTime(time: number) {
    this.model.currentTime = Math.min(Math.max(time, this.model.startTime), this.model.endTime)
    this.model.playStartedAt = Date.now()
  }

  @action
  togglePlayback(isPlaying: boolean = !this.model.isPlaying) {
    if (isPlaying) {
      // Reset to start if we want to play but are at the end of the time
      if (this.model.playTime >= this.model.endTime) {
        this.model.currentTime = 0
      }

      this.model.playStartedAt = Date.now()
    } else {
      this.model.currentTime = this.model.playTime
    }

    this.model.isPlaying = isPlaying
  }
}
