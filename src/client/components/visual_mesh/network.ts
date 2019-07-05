import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { CameraModel } from './camera/model'
import { VisualMeshRobotModel } from './model'
import VisualMesh = message.vision.VisualMesh
import Image = message.input.Image
import CompressedImage = message.output.CompressedImage

export class VisualMeshNetwork {
  constructor(private network: Network) {
    this.network.on(Image, this.onImage)
    this.network.on(CompressedImage, this.onImage)
    this.network.on(VisualMesh, this.onVisualMesh)
  }

  static of(nusightNetwork: NUsightNetwork): VisualMeshNetwork {
    const network = Network.of(nusightNetwork)
    return new VisualMeshNetwork(network)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onVisualMesh = (robotModel: RobotModel, packet: VisualMesh) => {
    const robot = VisualMeshRobotModel.of(robotModel)
    const { cameraId, neighbourhood, rays, classifications, k, r, h } = packet

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of(robot, {
        id: cameraId,
        name,
      })
      robot.cameras.set(cameraId, camera)
    }

    // We don't need to know phi, just how many items are in each ring
    camera.mesh = {
      neighbours: neighbourhood!.v!,
      rays: rays!.v!,
      classifications: { dim: classifications!.cols!, values: classifications!.v! },
      k: k!,
      r: r!,
      h: h!,
    }
  }

  @action
  private onImage = (robotModel: RobotModel, image: Image | CompressedImage) => {
    const robot = VisualMeshRobotModel.of(robotModel)
    const { cameraId, name, dimensions, format, data, Hcw } = image
    const { projection, focalLength, centre } = image!.lens!

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of(robot, { id: cameraId, name })
      robot.cameras.set(cameraId, camera)
    }
    camera.image = {
      width: dimensions!.x!,
      height: dimensions!.y!,
      format,
      data,
      lens: {
        projection: projection || 0,
        focalLength: focalLength! / dimensions!.x!,
        centre: Vector2.from(centre),
      },
      Hcw: Matrix4.from(Hcw),
    }
    camera.name = name
  }
}
