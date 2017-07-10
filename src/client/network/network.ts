import { NUsightNetwork } from './nusight_network'
import { MessageType } from './nusight_network'
import { MessageCallback } from './nusight_network'

export class Network {
  private offNUClearMessages: Set<() => void>

  public constructor(private nusightNetwork: NUsightNetwork) {
    this.offNUClearMessages = new Set()
  }

  public static of(nusightNetwork: NUsightNetwork): Network {
    return new Network(nusightNetwork)
  }

  public on<T>(messageType: MessageType<T>, cb: MessageCallback<T>): () => void {
    const offNUClearMessage = this.nusightNetwork.onNUClearMessage(messageType, cb)
    this.offNUClearMessages.add(offNUClearMessage)
    return () => {
      offNUClearMessage()
      this.offNUClearMessages.delete(offNUClearMessage)
    }
  }

  public off() {
    for (const offNUClearMessage of this.offNUClearMessages.values()) {
      offNUClearMessage()
    }
    this.offNUClearMessages.clear()
  }
}
