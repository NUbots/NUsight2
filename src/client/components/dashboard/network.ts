import { action } from 'mobx'
import { google } from '../../../shared/proto/messages'
import { message } from '../../../shared/proto/messages'
import { Vector2 } from '../../math/vector2'
import { Network } from '../../network/network'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { DashboardRobotModel } from './model'
import Overview = message.support.nubugger.Overview
import Timestamp = google.protobuf.Timestamp$Properties

export class DashboardNetwork {
  public constructor(private network: Network) {
    this.network.on(Overview, this.onOverview)
  }

  public static of(nusightNetwork: NUsightNetwork): DashboardNetwork {
    const network = Network.of(nusightNetwork)
    return new DashboardNetwork(network)
  }

  public destroy() {
    this.network.off()
  }

  @action
  private onOverview = (robotModel: RobotModel, overview: Overview) => {
    const robot = DashboardRobotModel.of(robotModel)
    const toSeconds = (timestamp: Timestamp | null): number => {
      if (!timestamp) {
        timestamp = { seconds: 0, nanos: 0 }
      }
      const seconds: number = Number(timestamp.seconds)
      const nanos: number = timestamp.nanos! || 0
      return seconds + (nanos * 1e-9)
    }

    robot.battery = overview.battery
    robot.ballPosition = Vector2.of(overview.ballPosition)
    robot.ballWorldPosition = Vector2.of(overview.ballWorldPosition)
    robot.behaviourState = overview.behaviourState
    robot.gameMode = overview.gameMode
    robot.gamePhase = overview.gamePhase
    robot.kickTarget = Vector2.of(overview.kickTarget)
    robot.lastCameraImage = toSeconds(overview.lastCameraImage)
    robot.lastSeenBall = toSeconds(overview.lastSeenBall)
    robot.lastSeenGoal = toSeconds(overview.lastSeenGoal)
    robot.lastSeenObstacle = toSeconds(overview.lastSeenObstacle)
    robot.penaltyReason = overview.penaltyReason
    robot.robotPosition = Vector2.of(overview.robotPosition)
    robot.time = Date.now () / 1000
    robot.voltage = overview.voltage
  }
}
