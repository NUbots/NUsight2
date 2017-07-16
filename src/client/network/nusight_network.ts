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
                     private messageTypePath: MessageTypePath,
                     private callbacks: {[key: string]: (message: any) => void},
                     private tokenSource : number) {

    // Register all our completion handlers
    free.forEach((worker) => {
      worker.addEventListener('message', (ev: MessageEvent) => {
        this.onTaskComplete(worker, ev.data)
      })
    })
  }

  public static of() {
    const free = []

    // We make a webworker for each cpu core we have
    for (let i = 0; i < navigator.hardwareConcurrency; ++i) {
      free.push(new DecodeWorker())
    }

    const messageTypePath = MessageTypePath.of()
    return new MessageDecoder(free, [], messageTypePath, {}, 0)
  }

  public decode<T>(type: MessageType<T>, packet: NUClearNetPacket, cb: (message: T) => void) {

    // Small packets aren't worth sending to a web worker just decode them here
    if (packet.payload.byteLength < 512) {
      cb(type.decode(packet.payload))
    }
    else {
      // Try to get a free worker to process with
      let worker = this.free.pop()

      // If we don't have a free worker but we are reliable, get the (hopefully) least busy one
      worker = worker === undefined ? this.busy.shift() : worker

      // Store our callback with a unique token so we can find it later
      const token = ++this.tokenSource
      this.callbacks[token] = cb

      // Execute on the webworker
      try {
        worker.postMessage({
          'type': this.messageTypePath.getPath(type),
          'token': token,
          'payload': packet.payload,
        }, [packet.payload])
        this.busy.push(worker)
      }
      catch (e) {
        this.free.push(worker)
      }
    }
  }

  private onTaskComplete(worker: Worker, msg: {token: string, output: any}) {

    // Find and execute our callback
    this.callbacks[msg.token](msg.output)
    delete this.callbacks[msg.token]

    // If this worker has finished all its tasks move it to the free list
    const w = this.busy.splice(this.busy.indexOf(worker), 1)[0]
    if (w !== undefined) {
      this.free.push(w)
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
      this.decoder.decode<T>(messageType, packet, (message: T) => {
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
