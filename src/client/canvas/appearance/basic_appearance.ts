import { observable } from 'mobx'

export class BasicAppearance {
  @observable public fillStyle: string
  @observable public lineWidth: number
  @observable public strokeStyle: string

  public static of(opts: Partial<BasicAppearance> = {}): BasicAppearance {
    return new BasicAppearance({
      fillStyle: opts.fillStyle || '#000',
      lineWidth: opts.lineWidth || 1,
      strokeStyle: opts.strokeStyle || '#000'
    })
  }

  constructor(opts: BasicAppearance) {
    Object.assign(this, opts)
  }
}
