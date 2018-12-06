// TODO map out each of the limbs into script line

import { computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { ScriptTunerModel } from '../model'

export class EditorViewModel {
  @observable cellWidth = 32
  @observable scaleX = 2
  @observable height = 200
  @observable currentTime = 1

  constructor(private model: ScriptTunerModel) {
  }

  static of = createTransformer((model: ScriptTunerModel): EditorViewModel => {
    return new EditorViewModel(model)
  })

  @computed
  get timelineLength() {
    let maxLength = 0

    this.model.servos.forEach(servo => {
      if (servo.frames.length > maxLength) {
        maxLength = servo.frames.length
      }
    })

    return maxLength
  }
}
