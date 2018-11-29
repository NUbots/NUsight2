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
  }

  @action
  updateFrame = (frameId: number, data: { time: number, angle: number }) => {
    const index = this.findFrame(frameId)

    if (index > -1) {
      this.model.frames[index].time = data.time
      this.model.frames[index].angle = data.angle
    }
  }

  @action
  removeFrame = (frameId: number): void => {
    const index = this.findFrame(frameId)

    if (index > -1) {
      this.model.frames.splice(index, 1)
    }
  }

  private findFrame(frameId: number) {
    return this.model.frames.findIndex(frame => frame.time === frameId)
  }
}
