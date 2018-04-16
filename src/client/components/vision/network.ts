import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Vector3 } from '../../math/vector3'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { VisionRobotModel } from './model'
import { VisionBallModel } from './model'
import Image = message.input.Image

export class VisionNetwork {
  constructor(private network: Network) {
    this.network.on(Image, this.onImage)
  }

  static of(nusightNetwork: NUsightNetwork): VisionNetwork {
    const network = Network.of(nusightNetwork)
    return new VisionNetwork(network)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onImage = (robotModel: RobotModel, image: Image) => {
    const robot = VisionRobotModel.of(robotModel)
    const BGGR = 0x52474742 // TODO
    robot.Hcw = Matrix4.from(image.Hcw)
    if (image.cameraId !== 0) {
      // TODO
      return
    }

    if (image.format !== BGGR) {
      throw new Error(`Unsupported image format: ${image.format}`)
    }

    robot.image = {
      format: image.format,
      width: image.dimensions!.x!,
      height: image.dimensions!.y!,
      data: image.data,
    }

    robot.balls = [
      new VisionBallModel(robot, {
        axis: new Vector3(1, 0, 0),
        gradient: Math.cos(Math.random() * 45 * Math.PI / 180),
      }),
    ]
  }
}
