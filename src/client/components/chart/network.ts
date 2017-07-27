import { action } from 'mobx'
import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { ChartRobotModel } from './model'
import DataPoint = message.support.nubugger.DataPoint

export class ChartNetwork {
  public constructor(private network: Network) {
    this.network.on(DataPoint, this.onDataPoint)
  }

  public static of(nusightNetwork: NUsightNetwork): ChartNetwork {
    const network = Network.of(nusightNetwork)
    return new ChartNetwork(network)
  }

  public destroy() {
    this.network.off()
  }

  @action
  private onDataPoint = (robotModel: RobotModel, data: DataPoint) => {
    const robot = ChartRobotModel.of(robotModel)
    const key = data.label
    const series = robot.series.get(key)
    const point = {
      timestamp: Date.now() / 1000,
      value: data.value
    }
    if (series) {
      series.points.push(point)
    } else {
      robot.series.set(key, { points: [point] })
    }
  }
}
