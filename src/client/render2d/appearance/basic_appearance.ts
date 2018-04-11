import { observable } from 'mobx'

export type BasicAppearanceOpts = {
  fill?: {
    color: string,
    alpha?: number
  },
  stroke?: {
    color: string,
    alpha?: number,
    width?: number
  }
}

export class BasicAppearance {
  @observable fill: {
    color: string,
    alpha: number
  } = {
    color: '#000000',
    alpha: 0,
  }
  @observable stroke: {
    color: string,
    alpha: number,
    width: number
  } = {
    color: '#000000',
    alpha: 0,
    width: 1,
  }

  constructor(opts: BasicAppearanceOpts) {
    Object.assign(this.fill, opts.fill)
    Object.assign(this.stroke, opts.stroke)

    this.stroke.alpha = opts.stroke && opts.stroke.alpha === undefined ? 1 : this.stroke.alpha
    this.fill.alpha = opts.fill && opts.fill.alpha === undefined ? 1 : this.fill.alpha
  }

  static of(opts: BasicAppearanceOpts = {}): BasicAppearance {
    return new BasicAppearance(opts)
  }
}
