import { action } from 'mobx'
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
  @observable stats = {
    packets: 0,
    packetsPerSecond: new Rate({ smoothing: 0.9, unitTime: 1000 }),
    bytes: 0,
    bytesPerSecond: new Rate({ smoothing: 0.9, unitTime: 1000 }),
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

  @action
  updateStats({ packets, bytes }: { packets: number, bytes: number }) {
    this.stats.packets += packets
    this.stats.packetsPerSecond.update(packets)
    this.stats.bytes += bytes
    this.stats.bytesPerSecond.update(bytes)
  }
}
