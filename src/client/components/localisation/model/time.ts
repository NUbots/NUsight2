import { observable } from 'mobx'
import { computed } from 'mobx'

export class TimeModel {
  @observable public time: number // seconds
  @observable public lastRenderTime: number // seconds

  constructor(opts: Partial<TimeModel>) {
    Object.assign(this, opts)
  }

  public static of() {
    return new TimeModel({
      time: 0,
      lastRenderTime: 0,
    })
  }

  @computed get timeSinceLastRender() {
    return this.time - this.lastRenderTime
  }
}
