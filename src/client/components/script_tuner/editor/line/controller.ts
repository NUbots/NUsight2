import { action } from 'mobx'

import { ScriptTunerModel, Servo } from '../../model'

export class LineEditorController {
  constructor(private model: Servo) {
    this.model = model
  }

  static of(model: Servo) {
    return new LineEditorController(model)
  }

  @action
  addFrame = (data: { time: number, angle: number }) => {
    this.model.frames.push({
      time: data.time,
      angle: data.angle,
      pGain: 0,
      iGain: 0,
      dGain: 0,
      torque: 0,
    })

    // Perserve the sorting by time. Array replaced as MobX's sort() is not in-place.
    this.model.frames = this.model.frames.slice().sort((a, b) => a.time - b.time)
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
