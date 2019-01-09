import * as bounds from 'binary-search-bounds'
import { computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { Frame, ScriptTunerModel } from '../model'

export class ViewerViewModel {
  constructor(private model: ScriptTunerModel) {
  }

  static of = createTransformer((model: ScriptTunerModel): ViewerViewModel => {
    return new ViewerViewModel(model)
  })

  @computed
  get servos() {
    return this.model.servos.map(servo => {
      const time = this.model.playTime
      const compare = (frame: Frame) => frame.time - time
      const rightFrame = bounds.gt(servo.frames, servo.frames[0], compare)

      if (rightFrame === servo.frames.length) {
        return [time, servo.frames[rightFrame - 1].angle]
      } else if (rightFrame === 0) {
        return [time, servo.frames[0].angle]
      }

      const leftFrame = rightFrame - 1

      return [time, interpolateAngle(servo.frames[leftFrame], servo.frames[rightFrame], time)]
    })
  }
}

function interpolateAngle(left: Frame, right: Frame, time: number): number {
  const { time: x1, angle: y1 } = left
  const { time: x2, angle: y2 } = right
  const slope = (y2 - y1) / (x2 - x1)

  return (slope * (time - x1)) + y1
}
