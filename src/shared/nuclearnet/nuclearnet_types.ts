export type NUClearPacketListener = (packet: NUClearNetPacket) => void

export type NUClearEventListener = (peer: NUClearNetPeer) => void

export type NUClearNetOptions = {
  name: string
  group?: string
  port?: number
  mtu?: number
}

export type NUClearNetSend = {
  type: string|Buffer
  payload: Buffer
  target?: string
  reliable?: boolean
}

export type NUClearNetPeer = {
  name: string
  address: string
  port: number
}

export type NUClearNetPacket = {
  peer: NUClearNetPeer
  payload: Buffer
}

export interface NUClearNetSocket {
  connect(options: NUClearNetOptions): () => void
  onJoin(cb: NUClearEventListener): () => void
  onLeave(cb: NUClearEventListener): () => void
  on(event: string, cb: NUClearPacketListener): () => void
  send(options: NUClearNetSend): void
}
