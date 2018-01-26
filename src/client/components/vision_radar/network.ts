import { action } from 'mobx'

import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'

import { VisionRadarRobotModel } from './model'
import VisualMesh = message.vision.VisualMesh

export class VisionRadarNetwork {
  constructor(private network: Network) {
    this.network.on(VisualMesh, this.onVisualMesh)
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

      robot.colors = mesh.indices!.map((idx, i) => [idx, [
        v[i * d + 0],
        v[i * d + 1],
        v[i * d + 2],
      ]] as [number, [number, number, number]])
    }
  }
}
