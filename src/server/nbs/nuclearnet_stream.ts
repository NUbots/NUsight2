import { NUClearNetOptions } from 'nuclearnet.js'
import { NUClearNetPeer } from 'nuclearnet.js'
import { NUClearNetPacket } from 'nuclearnet.js'
import * as stream from 'stream'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { hashType } from '../nuclearnet/fake_nuclearnet_server'
import { WebSocket } from '../nuclearnet/web_socket_server'

export type StreamEvent = StreamPacket | StreamJoinEvent | StreamLeaveEvent | StreamConnectEvent | StreamDisconnectEvent
export type StreamPacket = { type: 'packet', data: NUClearNetPacket }
export type StreamJoinEvent = { type: 'nuclear_join', data: NUClearNetPeer }
export type StreamLeaveEvent = { type: 'nuclear_leave', data: NUClearNetPeer }
export type StreamConnectEvent = { type: 'nuclear_connect', data: NUClearNetOptions }
export type StreamDisconnectEvent = { type: 'nuclear_disconnect', data: undefined }

export class NUClearNetStream extends stream.Duplex {
  private buffer: StreamPacket[] = []
  private buffering = false
  private disconnect?: () => void

  constructor(private nuclearnetClient: NUClearNetClient, private highWaterMark: number = 512) {
    super({
      objectMode: true,
      highWaterMark,
    })
    nuclearnetClient.onPacket(this.onPacket)
    nuclearnetClient.onJoin(this.onJoin)
    nuclearnetClient.onLeave(this.onLeave)
  }

  public static of(nuclearnetClient: NUClearNetClient, highWaterMark: number = 512) {
    return new NUClearNetStream(nuclearnetClient, highWaterMark)
  }

  // public push(event: StreamEvent | null): boolean {
  //   return super.push(event)
  // }
  //
  // public write(event: StreamEvent | null): boolean {
  //   return super.write(event)
  // }

  private bufferEvent(event: StreamPacket) {
    if (this.buffer.length < this.highWaterMark) {
      this.buffer.push(event)
    }
  }

  private onDrain = () => {
    this.buffering = false
    while (this.buffer.length > 0) {
      const event = this.buffer.shift()!
      if (!this.onPacket(event.data)) {
        break
      }
    }
  }

  private onPacket = (packet: NUClearNetPacket): boolean => {
    const event: StreamPacket = { type: 'packet', data: packet }
    if (this.buffering) {
      this.bufferEvent(event)
      return false
    } else if (!this.push(event)) {
      this.buffering = true
      return false
    }
    return true
  }

  private onJoin = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_join', data: peer })
  }

  private onLeave = (peer: NUClearNetPeer) => {
    this.push({ type: 'nuclear_leave', data: peer })
  }

  public _read(size: number) {
    if (this.buffering) {
      this.onDrain()
    }
  }

  public _write(event: StreamEvent, encoding: string, done: Function) {
    if (event.type === 'nuclear_connect') {
      this.disconnect = this.nuclearnetClient.connect(event.data)
    } else if (event.type === 'nuclear_disconnect') {
      this.disconnect && this.disconnect()
    }
    done()
  }

  // TODO (Annable): Automatically end when client disconnects?
  public end() {
    this.push(null)
  }
}

export class PeerFilter extends stream.Transform {
  constructor(private peer: NUClearNetPeer) {
    super({
      objectMode: true,
    })
  }

  static of(peer: NUClearNetPeer) {
    return new PeerFilter(peer)
  }

  push(event: StreamEvent | null): boolean {
    return super.push(event)
  }

  write(event: StreamEvent) {
    return super.write(event)
  }

  _transform(event: StreamEvent, encoding: string, done: (err?: any, data?: any) => void) {
    if (event.type !== 'packet' || this.isPeer(event.data.peer)) {
      this.push(event)
    }
    done()
  }

  isPeer(otherPeer: NUClearNetPeer) {
    return (
      otherPeer.name === this.peer.name
      && otherPeer.address === this.peer.address
      && otherPeer.port === this.peer.port
    )
  }
}

export class WebSocketStream extends stream.Duplex {
  private hashes: Map<string, string> = new Map()

  public constructor(private socket: WebSocket) {
    super({
      objectMode: true,
      highWaterMark: 512,
    })

    socket.on('listen', this.onListen)
    socket.on('unlisten', this.onUnlisten)
    socket.on('nuclear_connect', this.onConnect)
    socket.on('disconnect', this.onDisconnect)
  }

  static of(socket: WebSocket) {
    return new WebSocketStream(socket)
  }

  _read() {

  }

  _write(event: StreamEvent, encoding: string, done: Function) {
    if (event.type === 'packet') {
      const packet = event.data;
      const hexHash = packet.hash.toString('hex')
      if (this.hashes.has(hexHash)) {
        const eventName = this.hashes.get(hexHash)!;
        if (packet.reliable) {
          this.socket.send(eventName, packet)
          done()
        } else {
          this.socket.sendVolatile(eventName, packet, done)
        }
      }
    } else {
      this.socket.send(event.type, event.data)
      done()
    }
  }

  onListen = (event: string, requestToken: string) => {
    this.hashes.set(hashType(event).toString('hex'), event)
  }

  onUnlisten = () => {

  }

  onConnect = (options: NUClearNetOptions) => {
    const event: StreamConnectEvent = { type: 'nuclear_connect', data: options }
    this.push(event)
  }

  onDisconnect = () => {
    const event: StreamDisconnectEvent = { type: 'nuclear_disconnect', data: undefined }
    this.push(event)
  }
}
