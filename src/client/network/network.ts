import { NUsightNetwork } from './global_network'
import { MessageType } from './global_network'
import { Message } from './global_network'
import { MessageCallback } from './global_network'

export class Network {
  private offs: (() => void)[]

  public constructor(private nusightNetwork: NUsightNetwork) {
    this.offs = []
  }

  public static of(nusightNetwork: NUsightNetwork): Network {
    return new Network(nusightNetwork)
  }

  public on<T extends Message>(messageType: MessageType<T>, cb: MessageCallback<T>): () => void {
    const off = this.nusightNetwork.onNUClearMessage(messageType, cb)
    this.offs.push(off)
    return off
  }

  public off() {
    for (const off of this.offs) {
      off()
    }
    this.offs.length = 0
  }
}
