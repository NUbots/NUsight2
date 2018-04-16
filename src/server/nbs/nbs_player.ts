import * as bindings from 'bindings'
import { EventEmitter } from 'events'

export type NBSPacket = {
  timestamp: number
  hash: Buffer
  payload: Buffer
}

interface NBSPlayerAPI {
  new(file: string, cb: (packet: NBSPacket) => void): NBSPlayerAPI
  play(): void
  pause(): void
  restart(): void
  step(steps: number): void
  seek(timestamp: number): void
}

const NBSPlayerAPI = bindings<NBSPlayerAPI>('nbs_player')

export class NBSPlayer {

  private player: NBSPlayerAPI
  private emitter: EventEmitter = new EventEmitter()

  constructor(private file: string) {
    this.player = new NBSPlayerAPI(file, this.onNBSPacket)
  }

  static of(opts: {file: string}) {
    return new NBSPlayer(opts.file)
  }

  private onNBSPacket = (packet: NBSPacket) => {
    this.emitter.emit('packet', packet)
  }

  onPacket(cb: (packet: NBSPacket) => any): () => void {
    this.emitter.on('packet', cb)
    return () => {
      this.emitter.removeListener('packet', cb)
    }
  }

  onEnd(cb: () => any) : () => void {
    this.emitter.on('end', cb)
    return () => {
      this.emitter.removeListener('end', cb)
    }
  }

  play() {
    this.player.play()
  }

  pause() {
    this.player.pause()
  }

  restart() {
    this.player.restart()
  }

  step(steps: number) {
    this.player.step(steps)
  }

  seek(timestamp: number) {
    this.player.seek(timestamp)
  }
}
