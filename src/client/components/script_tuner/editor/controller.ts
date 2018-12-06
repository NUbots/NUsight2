import { action } from 'mobx'

import { EditorViewModel } from './view_model'

export class EditorController {
  constructor(private viewModel: EditorViewModel) {
    this.viewModel = viewModel
  }

  static of(viewModel: EditorViewModel) {
    return new EditorController(viewModel)
  }

  @action
  setCurrentTime = (time: number) => {
    this.viewModel.currentTime = time
  }
}
