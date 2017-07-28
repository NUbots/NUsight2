import { action } from 'mobx'
import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { VisionRobotModel } from './model'
import NUsightBalls = message.vision.NUsightBalls
import NUsightGoals = message.vision.NUsightGoals
import { Vector2 } from '../../math/vector2'

export class VisionNetwork {
  public constructor(private network: Network) {
    this.network.on(NUsightGoals, this.onGoals)
    this.network.on(NUsightBalls, this.onBalls)
  }

  public static of(nusightNetwork: NUsightNetwork): VisionNetwork {
    const network = Network.of(nusightNetwork)
    return new VisionNetwork(network)
  }

  public destroy() {
    this.network.off()
  }

  @action
  private onGoals = (robotModel: RobotModel, goals: NUsightGoals) => {
    const robot = VisionRobotModel.of(robotModel)
    // TODO
  }

  @action
  private onBalls = (robotModel: RobotModel, balls: NUsightBalls) => {
    const robot = VisionRobotModel.of(robotModel)
    // TODO
    robot.balls = balls.balls.map(ball => ({
      radius: ball.circle!.radius!,
      centre: Vector2.from(ball.circle!.centre!),
    }))
  }
}
