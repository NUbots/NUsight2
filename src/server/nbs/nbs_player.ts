import { EventEmitter } from 'events'
import * as bindings from 'bindings'

const NBSPlayerAPI = bindings('nbs_player')

export type NBSPacket = {
  timestamp: number
  hash: Buffer
  payload: Buffer
}

export class NBSPlayer extends EventEmitter {

  private player: any

  constructor(private file: string) {
    super()
    this.player = new NBSPlayerAPI()
    this.player.load(file, (timestamp?: number, hash?: Buffer, payload?: Buffer) => {
      if (payload !== undefined) {
        this.emit('packet', {
          timestamp,
          hash,
          payload,
        })
      } else {
        this.emit('end')
      }
    })
  }

  static of(opts: {file: string}) {
    return new NBSPlayer(opts.file)
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
