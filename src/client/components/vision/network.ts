import { action } from 'mobx'
import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { VisionRobotModel } from './model'
import NUsightBalls = message.vision.NUsightBalls
import NUsightGoals = message.vision.NUsightGoals
import Image = message.input.Image
import { Vector2 } from '../../math/vector2'

export class VisionNetwork {
  public constructor(private network: Network) {
    this.network.on(NUsightGoals, this.onGoals)
    this.network.on(NUsightBalls, this.onBalls)
    this.network.on(Image, this.onImage)
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
    robot.goals = goals.goals.map(goal => ({
      tl: Vector2.from(goal.quad!.tl!),
      tr: Vector2.from(goal.quad!.tr!),
      bl: Vector2.from(goal.quad!.bl!),
      br: Vector2.from(goal.quad!.br!),
    }))
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

  @action
  private onImage = (robotModel: RobotModel, image: Image) => {
    const robot = VisionRobotModel.of(robotModel)
    // TODO
    console.log('new image');
    const BGGR = 0x52474742
    if (image.format === BGGR) {
      robot.image.set(image.data)
    } else {
      throw new Error(`Unsupported image format: ${image.format}`)
    }
  }
}
