// TODO map out each of the limbs into script line

import { computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { ScriptTunerModel } from '../model'

export class EditorViewModel {
  @observable cellWidth = 32
  @observable scaleX = 2
  @observable height = 200

  constructor(private model: ScriptTunerModel) {
  }

  static of = createTransformer((model: ScriptTunerModel): EditorViewModel => {
    return new EditorViewModel(model)
  })

  @computed
  get timelineLength() {
    return this.model.scriptsLength
  }

  @computed
  get isPlaying() {
    return this.model.isPlaying
  }

  @computed
  get playTime() {
    return this.model.playTime
  }

  @computed
  get startTime() {
    return this.model.startTime
  }

  @computed
  get endTime() {
    return this.model.endTime
  }
}
