import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { CameraModel } from './camera/model'
import { VisionRobotModel } from './model'
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
    const { cameraId, name, dimensions, format, data, Hcw } = image

    const camera = robot.cameras.get(cameraId)
    if (!camera) {
      robot.cameras.set(cameraId, CameraModel.of({
        model: robot,
        id: cameraId,
        name,
      }))
    }
    camera!.image = {
      width: dimensions!.x!,
      height: dimensions!.y!,
      format: format!,
      data,
      Hcw: Matrix4.from(Hcw),
    }
    camera!.name = name
  }
}
