import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { VisionRadarRobotModel } from './model'
import VisualMesh = message.vision.VisualMesh
import Image = message.input.Image

export class VisionRadarNetwork {
  constructor(private network: Network) {
    this.network.on(VisualMesh, this.onVisualMesh)
    this.network.on(Image, this.onImage)
  }

  static of(nusightNetwork: NUsightNetwork): VisionRadarNetwork {
    const network = Network.of(nusightNetwork)
    return new VisionRadarNetwork(network)
  }

  destroy() {
    this.network.off()
  }

  @action
  private onVisualMesh = (robotModel: RobotModel, mesh: VisualMesh) => {
    const robot = VisionRadarRobotModel.of(robotModel)

    if (mesh.cameraId === 0) {
      robot.ringSegments = mesh.mesh!.map(v => v.segments!)

      const d = mesh.classifications[0].dimensions!
      const v = mesh.classifications[0].values!
      const cs = mesh.coordinates

      robot.colors = mesh.indices!.map((idx, i) => [idx, [
        v[i * d + 0],
        v[i * d + 1],
        v[i * d + 2],
      ]] as [number, [number, number, number]])

      robot.coordinates = mesh.indices!.map((idx, i) => [idx, [
        cs[i].x,
        cs[i].y,
      ]] as [number, [number, number]])
    }
  }

  @action
  private onImage = (robotModel: RobotModel, image: Image) => {
    const robot = VisionRadarRobotModel.of(robotModel)

    const BGGR = 0x52474742 // TODO
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
  }
}
