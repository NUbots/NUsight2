import throttle = require('lodash.throttle')
import { observable } from 'mobx'
import { runInAction } from 'mobx'

type RobotModelOpts = {
  id: string
  connected: boolean
  enabled: boolean
  name: string
  address: string
  port: number
}

export class RobotModel {
  @observable id: string
  @observable connected: boolean
  @observable enabled: boolean
  @observable name: string
  @observable address: string
  @observable port: number
  @observable packetReceived = false
  @observable dataRates = {
    packets: new Rate({ smoothing: 0.9, unitTime: 1000 }),
    bytes: new Rate({ smoothing: 0.9, unitTime: 1000 }),
  }

  constructor({ id, connected, enabled, name, address, port }: RobotModelOpts) {
    this.id = id
    this.connected = connected
    this.enabled = enabled
    this.name = name
    this.address = address
    this.port = port
  }

  static of(opts: RobotModelOpts) {
    return new RobotModel(opts)
  }
}

type RateOpts = {
  smoothing: number
  unitTime: number
}

class Rate {
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

  private commit = throttle((rate: number) => {
    runInAction(() => {
      this.rate = rate * this.unitTime
    })
  }, 1000)
}
