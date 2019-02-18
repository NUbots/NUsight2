import { action, computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { ScriptTunerController } from '../controller'

import { EditorViewModel } from './view_model'

interface EditorControllerOpts {
  viewModel: EditorViewModel,
  controller: ScriptTunerController
}

export class EditorController {
  viewModel: EditorViewModel
  controller: ScriptTunerController

  constructor(opts: EditorControllerOpts) {
    this.viewModel = opts.viewModel
    this.controller = opts.controller
  }

  static of = createTransformer((opts: EditorControllerOpts) => {
    return new EditorController(opts)
  })

  setPlayTime = (time: number) => {
    this.controller.setPlayTime(time)
  }

  play = () => {
    if (this.viewModel.isPlaying) {
      return
    }

    this.controller.togglePlayback(true)
  }

  pause = () => {
    if (!this.viewModel.isPlaying) {
      return
    }

    this.controller.togglePlayback(false)
  }

  togglePlayback = () => {
    this.controller.togglePlayback()
  }

  jumpToStart = () => {
    this.controller.setPlayTime(this.viewModel.startTime)
  }

  jumpToEnd = () => {
    this.controller.setPlayTime(this.viewModel.endTime)
  }

  @action
  zoomIn = () => {
    this.viewModel.scaleX = Math.min(this.viewModel.scaleX + 1, 10)
  }

  @action
  zoomOut = () => {
    this.viewModel.scaleX = Math.max(this.viewModel.scaleX - 1, 1)
  }
}
