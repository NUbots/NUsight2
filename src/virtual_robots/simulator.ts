import { IComputedValue } from 'mobx'

export interface Message {
  messageType: string
  buffer: Uint8Array
  reliable?: boolean
}

export interface Simulator {
  packets(): Array<IComputedValue<Message>>
}

