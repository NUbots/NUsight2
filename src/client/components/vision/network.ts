import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { CameraModel } from './camera/model'
import { VisionRobotModel } from './model'

import Image = message.input.Image
import CompressedImage = message.output.CompressedImage

export class VisionNetwork {

  constructor(private network: Network) {
    this.network.on(Image, this.onImage)
    this.network.on(CompressedImage, this.onImage)
  }

  static of(nusightNetwork: NUsightNetwork): VisionNetwork {
    const network = Network.of(nusightNetwork)
    return new VisionNetwork(network)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onImage = (robotModel: RobotModel, image: Image | CompressedImage) => {
    const robot = VisionRobotModel.of(robotModel)
    const { cameraId, name, dimensions, format, data, Hcw } = image
    const { projection, focalLength, centre } = image!.lens!

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of(robot, {
        id: cameraId,
        name,
      })
      robot.cameras.set(cameraId, camera)
    }
    camera.image = {
      width: dimensions!.x!,
      height: dimensions!.y!,
      format,
      data,
      lens: {
        projection,
        focalLength,
        centre: centre || Vector2.of(),
      },
      Hcw: Matrix4.from(Hcw),
    }
    camera.name = name
  }
}
