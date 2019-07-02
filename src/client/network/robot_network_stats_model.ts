import { observable } from 'mobx'

import { Clock } from '../../shared/time/clock'
import { memoize } from '../base/memoize'
import { RobotModel } from '../components/robot/model'
import { BrowserSystemClock } from '../time/browser_clock'

import { Rate } from './rate'

export class RobotNetworkStatsModel {
  @observable.ref packets: number = 0
  @observable.ref packetsPerSecond: Rate
  @observable.ref bytes: number = 0
  @observable.ref bytesPerSecond: Rate

  constructor(private robotModel: RobotModel, private clock: Clock) {
    this.packetsPerSecond = new Rate({ smoothing: 0.9 }, clock)
    this.bytesPerSecond = new Rate({ smoothing: 0.9 }, clock)
  }

  static of = memoize((robotModel: RobotModel) => {
    return new RobotNetworkStatsModel(robotModel, BrowserSystemClock)
  })
}
