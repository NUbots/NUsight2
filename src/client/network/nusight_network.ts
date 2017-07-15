import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { WebSocketProxyNUClearNetClient } from '../nuclearnet/web_socket_proxy_nuclearnet_client'
import { MessageTypePath } from './message_type_names'
import { RobotModel } from '../components/robot/model'
import { AppModel } from '../components/app/model'
import * as DecodeWorker from './decode.worker.ts'

export class MessageDecoder {
  public constructor(private free: Worker[],
                     private busy: Worker[],
                     private callbacks: {[key: string]: (message: any) => void},
                     private tokenSource : number) {

    // Register all our completion handlers
    free.forEach((worker) => {
      worker.addEventListener('message', (ev: MessageEvent) => {
        this.onTaskComplete(worker, ev.data[0], ev.data[1])
      })
    })
  }

  public static of() {
    const free = []
    for (let i = 0; i < navigator.hardwareConcurrency; ++i) {
      free.push(new DecodeWorker())
    }
    return new MessageDecoder(free, [], {}, 0)
  }

  public decode<T>(type: string, packet: NUClearNetPacket, cb: (message: T) => void) {

    // Try to get a worker to process with
    let worker = this.free.pop()

    // If we don't have a free worker but we are reliable, get a busy one
    worker = worker === undefined && packet.reliable ? this.busy.shift() : worker

    // We drop packets if they are unreliable and we are too busy to process them
    if (worker !== undefined) {
      // Store our callback with a unique token so we can find it later
      const token = ++this.tokenSource
      this.callbacks[token] = cb

      // Execute on the webworker
      worker.postMessage({
        'type': type,
        'token': token,
      }, [packet.payload])
      this.busy.push(worker)
    }
  }

  private onTaskComplete(worker: Worker, msg: {token: string, tasks: number}, protobuf: any) {

    // Find and execute our callback
    this.callbacks[msg.token](protobuf)
    delete this.callbacks[msg.token]

    // If this worker has finished all its tasks move it to the free list
    if (msg.tasks == 0) {
      this.free.push(this.busy.splice(this.busy.indexOf(worker), 1)[0])
    }
  }
}

/**
 * This class is intended to handle NUsight-specific networking. It handles the subscription of NUClearNet messages and
 * decoding them into real protobufjs objects for convenient use. Components should not directly use this class, but
 * instead create their own ComponentNetwork class which uses the Network helper class.
 */
export class NUsightNetwork {
  public constructor(private nuclearnetClient: NUClearNetClient,
                     private appModel: AppModel,
                     private messageTypePath: MessageTypePath,
                     private decoder: MessageDecoder) {
  }

  public static of(appModel: AppModel) {
    const messageTypePath = MessageTypePath.of()
    const nuclearnetClient: NUClearNetClient = WebSocketProxyNUClearNetClient.of()
    const decoder = MessageDecoder.of()
    return new NUsightNetwork(nuclearnetClient, appModel, messageTypePath, decoder)
  }

  public connect(opts: NUClearNetOptions): () => void {
    return this.nuclearnetClient.connect(opts)
  }

  public onNUClearMessage<T>(messageType: MessageType<T>, cb: MessageCallback<T>) {
    const messageTypeName = this.messageTypePath.getPath(messageType)
    return this.nuclearnetClient.on(`NUsight<${messageTypeName}>`, (packet: NUClearNetPacket) => {

      // Pass off to our webworker decoder
      this.decoder.decode<T>(messageTypeName, packet, (message: T) => {
        const robotModel = this.appModel.robots.find(robot => {
          return robot.name === packet.peer.name
            && robot.address === packet.peer.address
            && robot.port === packet.peer.port
        })
        if (robotModel) {
          cb(robotModel, message)
        }
      })
    })
  }

  public onNUClearJoin(cb: (peer: NUClearNetPeer) => void) {
    this.nuclearnetClient.onJoin(cb)
  }

  public onNUClearLeave(cb: (peer: NUClearNetPeer) => void) {
    this.nuclearnetClient.onLeave(cb)
  }
}

export interface MessageType<T> {
  new(...args: any[]): T
  decode(...args: any[]): T
}

export type MessageCallback<T> = (robotModel: RobotModel, message: T) => void
