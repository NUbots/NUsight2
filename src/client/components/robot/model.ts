import { observable } from 'mobx'

import { Rate } from './rate'

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
