import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { WebSocketProxyNUClearNetClient } from '../nuclearnet/web_socket_proxy_nuclearnet_client'
import { MessageTypePath } from './message_type_names'
import { RobotModel } from '../components/robot/model'
import { AppModel } from '../components/app/model'
import { WebSocketClient } from '../nuclearnet/web_socket_client'

const HEADER_SIZE = 9

/**
 * This class is intended to handle NUsight-specific networking. It handles the subscription of NUClearNet messages and
 * decoding them into real protobufjs objects for convenient use. Components should not directly use this class, but
 * instead create their own ComponentNetwork class which uses the Network helper class.
 */
export class NUsightNetwork {
  private nextRequestTokenId: number

  public constructor(private nuclearnetClient: NUClearNetClient,
                     private socket: WebSocketClient,
                     private appModel: AppModel,
                     private messageTypePath: MessageTypePath) {
    this.nextRequestTokenId = 0
  }

  public static of(appModel: AppModel) {
    const messageTypePath = MessageTypePath.of()
    const nuclearnetClient: NUClearNetClient = WebSocketProxyNUClearNetClient.of()
    const uri = `${document.location.origin}/nusight`
    const socket = WebSocketClient.of(uri, {
      upgrade: false,
      transports: ['websocket'],
    })
    return new NUsightNetwork(nuclearnetClient, socket, appModel, messageTypePath)
  }

  public connect(opts: NUClearNetOptions): () => void {
    return this.nuclearnetClient.connect(opts)
  }

  public onNUClearMessage<T>(messageType: MessageType<T>, cb: MessageCallback<T>) {
    const messageTypeName = this.messageTypePath.getPath(messageType)
    return this.nuclearnetClient.on(`NUsight<${messageTypeName}>`, (packet: NUClearNetPacket) => {
      // Remove NUsight header for decoding by protobufjs
      const buffer = new Uint8Array(packet.payload).slice(HEADER_SIZE)
      const message = messageType.decode(buffer)
      const peer = packet.peer
      const robotModel = this.appModel.robots.find(robot => {
        return robot.name === peer.name && robot.address === peer.address && robot.port === peer.port
      })
      if (robotModel) {
        cb(robotModel, message)
      }
    })
  }

  public onNUClearJoin(cb: (peer: NUClearNetPeer) => void) {
    this.nuclearnetClient.onJoin(cb)
  }

  public onNUClearLeave(cb: (peer: NUClearNetPeer) => void) {
    this.nuclearnetClient.onLeave(cb)
  }

  public record(peer: NUClearNetPeer): () => void {
    const token = this.getNextRequestToken()
    this.socket.send('record', peer, token)
    return () => {
      console.log(`unrecording for ${peer}`)
      this.socket.send('unrecord', token)
    }
  }

  private getNextRequestToken() {
    return String(this.nextRequestTokenId++)
  }
}

export interface MessageType<T> {
  new(...args: any[]): T
  decode(...args: any[]): T
}

export type MessageCallback<T> = (robotModel: RobotModel, message: T) => void
