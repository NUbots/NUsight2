import { action, computed, observable } from 'mobx'

import { EditorViewModel } from './view_model'

export class EditorController {
  raf = 0

  constructor(private viewModel: EditorViewModel) {
    // console.log('Constructor recreated')
    this.viewModel = viewModel
  }

  static of(viewModel: EditorViewModel) {
    return new EditorController(viewModel)
  }

  @computed
  get startTime() {
    return 0
  }

  @computed
  get endTime() {
    return this.viewModel.timelineLength - 1
  }

  @action
  setCurrentTime = (time: number) => {
    this.viewModel.currentTime = Math.min(Math.max(time, this.startTime), this.endTime)
  }

  @action
  play = () => {
    if (this.viewModel.isPlaying) {
      return
    }

    this.raf = requestAnimationFrame(this.playNextFrame)
    this.viewModel.isPlaying = true
  }

  @action
  playNextFrame = () => {
    this.viewModel.currentTime = Math.min(
      this.viewModel.currentTime + (this.viewModel.cellWidth / this.viewModel.scaleX / 60),
      this.endTime,
    )

    if (this.viewModel.currentTime === this.endTime) {
      // console.log('ended')
      this.raf = 0
      this.viewModel.isPlaying = false
    } else {
      this.raf = requestAnimationFrame(this.playNextFrame)
      // console.log(this.raf)
    }
  }

  @action
  pause = () => {
    if (!this.viewModel.isPlaying) {
      return
    }

    cancelAnimationFrame(this.raf!)
    this.raf = 0
    this.viewModel.isPlaying = false
  }

  @action
  togglePlayback = () => {
    // console.log('Toggling playback', this.viewModel.isPlaying)

    if (this.viewModel.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  @action
  jumpToStart = () => {
    this.viewModel.currentTime = 0
  }

  @action
  jumpToEnd = () => {
    this.viewModel.currentTime = this.viewModel.timelineLength - 1
  }
}
