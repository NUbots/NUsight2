import * as bounds from 'binary-search-bounds'
import { action } from 'mobx'

import { Frame, ScriptTunerModel, Servo } from '../../model'

export class LineEditorController {
  constructor(private model: Servo) {
    this.model = model
  }

  static of(model: Servo) {
    return new LineEditorController(model)
  }

  @action
  addFrame = (data: { time: number, angle: number }) => {
    const frame = {
      time: data.time,
      angle: data.angle,
      pGain: 0,
      iGain: 0,
      dGain: 0,
      torque: 0,
    }

    const index = findNextIndexForTime(data.time, this.model.frames)

    if (index > 0) {
      this.model.frames.splice(index, 0, frame)
    } else {
      this.model.frames.unshift(frame)
    }
  }

  @action
  updateFrame = (frameIndex: number, data: { time: number, angle: number }) => {
    this.model.frames[frameIndex].time = data.time
    this.model.frames[frameIndex].angle = data.angle
  }

  @action
  removeFrame = (frameIndex: number) => {
    this.model.frames.splice(frameIndex, 1)
  }
}

function findNextIndexForTime(time: number, frames: Frame[]) {
  return bounds.gt(frames, frames[0], (frame: Frame) => {
    return frame.time - time
  })
}
