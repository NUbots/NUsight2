import { inject } from 'inversify'
import { injectable } from 'inversify'
import { message } from '../../shared/proto/messages'
import { RawSocket } from './raw_socket'
import Sensors = message.input.Sensors

@injectable()
export class GlobalNetwork {
  private listeners: Map<MessageType<Message>, Set<MessageCallback<Message>>>
  private packetListeners: Map<string, (messageType: MessageType<Message>, buffer: ArrayBuffer) => void>

  public constructor(@inject(RawSocket) private socket: RawSocket) {
    this.listeners = new Map()
    this.packetListeners = new Map()
  }

  public on<T extends Message>(messageType: MessageType<T>, cb: MessageCallback<T>) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set())
    }
    const listeners = this.listeners.get(messageType)
    if (listeners) {
      const messageTypeName = getMessageTypeName(messageType)
      listeners.add(cb)
      if (listeners.size === 1) {
        this.socket.listen(messageTypeName)
        const listener = this.onPacket.bind(this, messageType)
        this.socket.on(messageTypeName, listener)
        this.packetListeners.set(messageTypeName, listener)
      }
    }
  }

  public off<T extends Message>(messageType: MessageType<T>, cb: MessageCallback<T>) {
    const listeners = this.listeners.get(messageType)
    if (listeners) {
      const messageTypeName = getMessageTypeName(messageType)
      listeners.delete(cb)
      const packetListener = this.packetListeners.get(messageTypeName)
      if (packetListener) {
        this.socket.off(messageTypeName, packetListener)
        if (listeners.size === 0) {
          this.socket.unlisten(messageTypeName)
          this.packetListeners.delete(messageTypeName)
        }
      }
    }
  }

  private onPacket(messageType: MessageType<Message>, buffer: ArrayBuffer) {
    const message = messageType.decode(new Uint8Array(buffer).slice(9))
    const listeners = this.listeners.get(messageType)
    if (listeners) {
      for (const listener of listeners.values()) {
        listener(message)
      }
    }
  }
}

function getMessageTypeName(messageType: MessageType<Message>) {
  // TODO (Annable): Generate this map.
  if (messageType === Sensors) {
    return 'message.input.Sensors'
  }
  throw new Error(`Unknown type given ${messageType}`)
}

export interface Message {
}

export interface MessageType<T extends Message> {
  new(...args: any[]): T
  decode(...args: any[]): T
}

export type MessageCallback<T extends Message> = (message: T) => void
