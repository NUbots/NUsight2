import { action } from 'mobx'

import { BrowserSystemClock } from '../../../client/time/browser_clock'
import { message } from '../../../shared/proto/messages'
import { Clock } from '../../../shared/time/clock'
import { Vector2 } from '../../math/vector2'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { ChartRobotModel, SeriesModel } from './model'
import DataPoint = message.support.nubugger.DataPoint

export class ChartNetwork {
  constructor(private clock: Clock,
              private network: Network) {
    this.network.on(DataPoint, this.onDataPoint)
  }

  static of(nusightNetwork: NUsightNetwork): ChartNetwork {
    const network = Network.of(nusightNetwork)
    return new ChartNetwork(BrowserSystemClock, network)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onDataPoint = (robotModel: RobotModel, data: DataPoint) => {
    const robot = ChartRobotModel.of(robotModel)
    const key = data.label
    const timestamp = this.clock.performanceNow()
    if (!robot.series.get(key)) {
      robot.series.set(key, data.value.map(() => SeriesModel.of()))
    }
    const seriesList = robot.series.get(key) as SeriesModel[]

    data.value.forEach((value, index) => {
      const point = Vector2.of(timestamp, value)
      const series = seriesList[index]
      if (!series) {
        throw new Error('Series should exist.')
      }
      series.append(point)
    })
  }
}
