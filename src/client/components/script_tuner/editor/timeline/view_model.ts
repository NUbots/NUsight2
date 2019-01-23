import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { EditorViewModel } from '../view_model'

export class TimelineViewModel {
  private editorViewModel: EditorViewModel

  constructor(editorViewModel: EditorViewModel) {
    this.editorViewModel = editorViewModel
  }

  static of = createTransformer((editorViewModel: EditorViewModel): TimelineViewModel => {
    return new TimelineViewModel(editorViewModel)
  })

  @computed
  get scaleX() {
    return this.editorViewModel.scaleX
  }

  @computed
  get cellWidth() {
    return this.editorViewModel.cellWidth
  }

  @computed
  get width() {
    return this.editorViewModel.timelineLength * this.cellWidth * this.scaleX
  }

  @computed
  get height() {
    return 24
  }

  @computed
  get timelineLength() {
    return this.editorViewModel.timelineLength
  }

  @computed
  get cells() {
    return new Array(Math.ceil(this.editorViewModel.timelineLength * this.scaleX)).fill(0)
  }

  @computed
  get playHeadPosition() {
    const playHeadWidth = 23 // The rendered width of the playhead SVG element, from devtools
    return this.timeToSvg(this.editorViewModel.playTime) - (playHeadWidth / 2)
  }

  timeToSvg(time: number) {
    return time * this.cellWidth * this.scaleX
  }

  svgToTime(coordinate: number) {
    return coordinate / this.cellWidth / this.scaleX
  }
}
