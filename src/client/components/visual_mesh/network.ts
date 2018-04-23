import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Matrix4 } from '../../math/matrix4'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { CameraModel } from './camera/model'
import { VisualMeshRobotModel } from './model'
import VisualMesh = message.vision.VisualMesh
import Image = message.input.Image

export class VisualMeshNetwork {
  constructor(private network: Network) {
    this.network.on(Image, this.onImage)
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
    const { cameraId, mesh, indices, neighbourhood, coordinates, classifications } = packet

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of(robot, {
        id: cameraId,
        name,
      })
      robot.cameras.set(cameraId, camera)
    }

    // We don't need to know phi, just how many items are in each ring
    camera.mesh.segments = mesh!.map(v => v.segments!)

    // Coordinates for UV mapping
    camera.mesh.coordinates = indices!.map((idx, i) => [idx, [
      coordinates[i].x,
      coordinates[i].y,
    ]] as [number, [number, number]])

    // Each of the output layer classes
    // camera.mesh.classes = classifications.map((layer) => (
    //   indices.map((idx, i) => {
    //     const v = []
    //     for (let d = 0; i < layer.dimensions!; d++) {
    //       v.push(layer.values![i * layer.dimensions! + d])
    //     }
    //     return [idx, v] as [number, number[]]
    //   })
    // ))
  }

  @action
  private onImage = (robotModel: RobotModel, image: Image) => {
    const robot = VisualMeshRobotModel.of(robotModel)
    const { cameraId, name, dimensions, format, data, Hcw } = image

    let camera = robot.cameras.get(cameraId)
    if (!camera) {
      camera = CameraModel.of(robot, {
        id: cameraId,
        name,
      })
      robot.cameras.set(cameraId, camera)
    }
    camera!.image = {
      width: dimensions!.x!,
      height: dimensions!.y!,
      format: format!,
      data,
    }
    camera!.name = name
  }
}
