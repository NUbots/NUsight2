import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Vector3 } from '../../math/vector3'
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

    if (!robot.cameras.has(image.cameraId)) {
      robot.cameras.set(image.cameraId, CameraModel.of({
        model: robot,
        id: image.cameraId,
      }))
    }

    const camera = robot.cameras.get(image.cameraId)!

    camera.image = {
      width: image.dimensions!.x!,
      height: image.dimensions!.y!,
      format: image.format!,
      data: image.data,
      Hcw: Matrix4.from(image.Hcw),
    }
    camera.name = image.name
  }
}
