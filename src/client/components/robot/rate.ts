import { observable } from 'mobx'
import { runInAction } from 'mobx'
import { throttle } from 'throttle-debounce'

import { Clock, getClock } from '../../../shared/time/clock'

type RateOpts = {
  smoothing: number
  unitTime: number
}

export class Rate {
  @observable rate = 0
  private currentRate: number = 0
  private smoothing: number
  private unitTime: number
  private currentUpdateCount: number = 0
  private lastUpdateTime?: number

  constructor({ smoothing, unitTime }: RateOpts, private clock: Clock) {
    this.smoothing = smoothing
    this.unitTime = unitTime
  }

  static of(opts: RateOpts) {
    return new Rate(opts, getClock())
  }

  update(newCount: number) {
    const now = this.clock.performanceNow()

    if (now === this.lastUpdateTime) {
      this.currentUpdateCount += newCount
    } else {
      if (this.lastUpdateTime) {
        // Update the current rate using the culmulative sum for the ending time period
        this.currentRate =
          this.currentRate * this.smoothing +
          this.currentUpdateCount / (now - this.lastUpdateTime) *
          (1.0 - this.smoothing)

        // Commit the current rate at a throttled interval
        this.commit(this.currentRate)

        // Start the new culmulative sum for the next rate update
        this.currentUpdateCount = newCount
      }
    }

    this.lastUpdateTime = now
  }

  private commit = throttle(1000, (rate: number) => {
    runInAction(() => {
      this.rate = rate * this.unitTime
    })
  })
}
