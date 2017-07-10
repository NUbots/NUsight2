import { NUClearNetPacket } from 'nuclearnet.js'
import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { message } from '../../shared/proto/messages'
import { WebSocketProxyNUClearNetClient } from '../nuclearnet/web_socket_proxy_nuclearnet_client'
import { MessageTypePath } from './message_type_names'
import Sensors = message.input.Sensors

const HEADER_SIZE = 9

export class NUsightNetwork {
  public constructor(private nuclearnetClient: NUClearNetClient,
                     private messageTypePath: MessageTypePath) {
  }

  public static of() {
    const messageTypePath = MessageTypePath.of()
    const nuclearnetClient: NUClearNetClient = WebSocketProxyNUClearNetClient.of()
    return new NUsightNetwork(nuclearnetClient, messageTypePath)
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
      cb(message)
    })
  }
}

export interface MessageType<T> {
  new(...args: any[]): T
  decode(...args: any[]): T
}

export type MessageCallback<T> = (message: T) => void
