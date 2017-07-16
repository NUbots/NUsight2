import { action } from 'mobx'
import { NUsightNetwork } from '../../network/nusight_network'
import { RecordRobotModel } from './model'

export class RecordController {
  public constructor(private nusightNetwork: NUsightNetwork) {
  }

  public static of(nusightNetwork: NUsightNetwork): RecordController {
    return new RecordController(nusightNetwork)
  }

  @action
  onStartRecordingClick(robot: RecordRobotModel) {
    const peer = { name: robot.name, address: robot.address, port: robot.port }
    robot.stopRecording = this.nusightNetwork.record(peer)
    robot.recording = true
  }

  @action
  onStopRecordingClick(robot: RecordRobotModel) {
    if (robot.stopRecording) {
      robot.stopRecording()
    }
    robot.recording = false
  }
}
