import { action } from 'mobx'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUsightNetwork } from '../../network/nusight_network'
import { RobotModel } from '../robot/model'
import { AppModel } from './model'
import { Clock } from '../../../shared/base/clock'
import { BrowserSystemClock } from '../../base/browser_clock'

export class AppNetwork {
  public constructor(private nusightNetwork: NUsightNetwork,
                     private clock: Clock,
                     private model: AppModel) {
    nusightNetwork.onNUClearJoin(this.onJoin)
    nusightNetwork.onNUClearLeave(this.onLeave)
  }

  public static of(nusightNetwork: NUsightNetwork, model: AppModel) {
    return new AppNetwork(nusightNetwork, BrowserSystemClock, model)
  }

  @action
  private onJoin = (peer: NUClearNetPeer) => {
    if (peer.name === 'nusight') {
      return
    }

    const robot = this.findRobot(peer)

    if (robot) {
      robot.connected = true
      // Keep this in sync, since the port will likely change per connection.
      robot.port = peer.port
    } else {
      this.model.robots.push(RobotModel.of({
        name: peer.name,
        address: peer.address,
        port: peer.port,
        connected: true,
        lastDisconnectedTimestamp: 0,
        enabled: true, // TODO (Annable): Only automatically enable robots that have connected shortly after load.
      }))
    }
  }

  @action
  private onLeave = (peer: NUClearNetPeer) => {
    if (peer.name === 'nusight') {
      return
    }

    const robot = this.model.robots.find(otherRobot => {
      return otherRobot.name === peer.name && otherRobot.address === peer.address && otherRobot.port === peer.port
    })
    if (robot) {
      robot.connected = false
      robot.lastDisconnectedTimestamp = this.clock.now()
    }
  }

  private findRobot(peer: NUClearNetPeer): RobotModel | undefined {
    let candidates = this.model.robots.filter(otherRobot => {
      return otherRobot.name === peer.name && otherRobot.address === peer.address
    })
    /*
     * Robots are not always uniquely identifiable across connections since they may have the same name and address.
     * We essentially guess and pick the first candidate.
     */
    return candidates.length > 0 ? candidates[0] : undefined
  }
}
