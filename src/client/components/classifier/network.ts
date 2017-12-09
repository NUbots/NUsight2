import { action } from 'mobx'
import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { ClassifierRobotModel } from './model'
import LookUpTableDiff = message.vision.LookUpTableDiff

export class ClassifierNetwork {
  public constructor(private network: Network) {
    this.network.on(LookUpTableDiff, this.onLookUpTableDiff)
  }

  public static of(nusightNetwork: NUsightNetwork): ClassifierNetwork {
    const network = Network.of(nusightNetwork)
    return new ClassifierNetwork(network)
  }

  public destroy() {
    this.network.off()
  }

  @action
  private onLookUpTableDiff = (robotModel: RobotModel, lookUpTableDiff: LookUpTableDiff) => {
    const robot = ClassifierRobotModel.of(robotModel)
    const { diff } = lookUpTableDiff
    diff.forEach(d => {
      const { lutIndex, classification } = d
      robot.lut.set(lutIndex!, classification!)
    })
  }
}
