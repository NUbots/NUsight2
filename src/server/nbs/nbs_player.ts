import * as bindings from 'bindings'
import { EventEmitter } from 'events'

export type NBSPacket = {
  timestamp: number
  hash: Buffer
  payload: Buffer
}

interface NBSPlayerAPIStatic {
  new(file: string, cb: (timestamp?: number, hash?: Buffer, payload?: Buffer) => void): NBSPlayerAPI
}

interface NBSPlayerAPI {
  play(): void

  pause(): void

  restart(): void

  step(steps: number): void

  seek(timestamp: number): void
}

const NBSPlayerAPI = bindings('nbs_player') as NBSPlayerAPIStatic

export class NBSPlayer {

  private player: NBSPlayerAPI
  private emitter: EventEmitter = new EventEmitter()

  private constructor(private file: string) {
    this.player = new NBSPlayerAPI(file, this.onNBSPacket)
  }

  static of(opts: { file: string }) {
    return new NBSPlayer(opts.file)
  }

  private onNBSPacket = (timestamp?: number, hash?: Buffer, payload?: Buffer) => {
    if (payload) {
      this.emitter.emit('packet', {
        timestamp, hash, payload
      })
    }
    else {
      this.emitter.emit('end')
    }
  }

  onPacket(cb: (packet: NBSPacket) => void): () => void {
    this.emitter.on('packet', cb)
    return () => {
      this.emitter.removeListener('packet', cb)
    }
  }

  onEnd(cb: () => void): () => void {
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
