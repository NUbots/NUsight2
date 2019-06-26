import { observable } from 'mobx'
import { runInAction } from 'mobx'
import { throttle } from 'throttle-debounce'

type RateOpts = {
  smoothing: number
  unitTime: number
}

export class Rate {
  @observable rate = 0
  private currentRate: number = 0
  private smoothing: number
  private unitTime: number
  private lastUpdateTime?: number

  constructor({ smoothing, unitTime }: RateOpts) {
    this.smoothing = smoothing
    this.unitTime = unitTime
  }

  update(newCount: number) {
    if (this.lastUpdateTime) {
      this.currentRate =
        this.currentRate * this.smoothing +
        newCount / (Date.now() - this.lastUpdateTime) *
        (1.0 - this.smoothing)

      this.commit(this.currentRate)
    }

    this.lastUpdateTime = Date.now()
  }

  private commit = throttle(1000, (rate: number) => {
    runInAction(() => {
      this.rate = rate * this.unitTime
    })
  })
}
