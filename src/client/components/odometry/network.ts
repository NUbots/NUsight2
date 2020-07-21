import { action } from 'mobx'
import * as THREE from 'three'
import { Matrix4 } from '../../math/matrix4'
import { Vector3 } from '../../math/vector3'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { OdometryRobotModel } from './model'
import { message } from '../../../shared/proto/messages'

enum BodySide {
  Left = 0,
  Right = 1,
}

enum ServoID {
  R_SHOULDER_PITCH = 0,
  L_SHOULDER_PITCH = 1,
  R_SHOULDER_ROLL = 2,
  L_SHOULDER_ROLL = 3,
  R_ELBOW = 4,
  L_ELBOW = 5,
  R_HIP_YAW = 6,
  L_HIP_YAW = 7,
  R_HIP_ROLL = 8,
  L_HIP_ROLL = 9,
  R_HIP_PITCH = 10,
  L_HIP_PITCH = 11,
  R_KNEE = 12,
  L_KNEE = 13,
  R_ANKLE_PITCH = 14,
  L_ANKLE_PITCH = 15,
  R_ANKLE_ROLL = 16,
  L_ANKLE_ROLL = 17,
  HEAD_YAW = 18,
  HEAD_PITCH = 19,
  NUMBER_OF_SERVOS = 20,
}

export class OdometryNetwork {
  constructor(private network: Network) {
    this.network.on(message.input.Sensors, this.onSensors)
  }

  static of(nusightNetwork: NUsightNetwork): OdometryNetwork {
    const network = Network.of(nusightNetwork)
    return new OdometryNetwork(network)
  }

  destroy = () => {
    this.network.off()
  }

  @action.bound
  private onSensors(robotModel: RobotModel, packet: message.input.Sensors) {
    const robot = OdometryRobotModel.of(robotModel)
    robot.visualizerModel.Hwt = Matrix4.fromThree(
      new THREE.Matrix4().getInverse(Matrix4.from(packet.Htw).toThree()),
    )
    robot.visualizerModel.accelerometer = Vector3.from(packet.accelerometer)
    // TODO
    if (packet.feet.length) {
      robot.visualizerModel.leftFoot = {
        down: !!packet.feet[BodySide.Left].down,
        Hwf: Matrix4.from(packet.feet[BodySide.Left].Hwf),
        Htf: Matrix4.from(packet.Htx[ServoID.L_ANKLE_ROLL]),
      }
      robot.visualizerModel.rightFoot = {
        down: !!packet.feet[BodySide.Right].down,
        Hwf: Matrix4.from(packet.feet[BodySide.Right].Hwf),
        Htf: Matrix4.from(packet.Htx[ServoID.R_ANKLE_ROLL]),
      }
    }
  }
}
