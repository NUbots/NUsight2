import { action } from 'mobx'
import { message } from '../../../shared/proto/messages'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { VisionRadarRobotModel } from './model'
import VisualMesh = message.vision.VisualMesh

export class VisionRadarNetwork {
  public constructor(private network: Network) {
    this.network.on(VisualMesh, this.onVisualMesh)
  }

  public static of(nusightNetwork: NUsightNetwork): VisionRadarNetwork {
    const network = Network.of(nusightNetwork)
    return new VisionRadarNetwork(network)
  }

  public destroy() {
    this.network.off()
  }

  @action
  private onVisualMesh = (robotModel: RobotModel, mesh: VisualMesh) => {
    const robot = VisionRadarRobotModel.of(robotModel)

    if(mesh.cameraId === 0) {
      robot.ringSegments = mesh.mesh!.map(v => v.segments!)

      const d = mesh.classifications[0].dimensions!
      const v = mesh.classifications[0].values!

      robot.colors = mesh.indices!.map((idx, i) => [idx, [
        Math.max(Math.min(Math.floor(v[i * d + 0] * 255), 255), 0),
        Math.max(Math.min(Math.floor(v[i * d + 1] * 255), 255), 0),
        Math.floor(v[i * d + 2] * 255)]
      ] as [number, [number, number, number]])
    }
  }
}
