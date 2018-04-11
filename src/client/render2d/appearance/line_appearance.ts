import { observable } from 'mobx'


export type LineAppearanceOpts = {
  stroke?: {
    color: string,
    alpha?: number,
    width?: number,
    cap?: 'butt' | 'round' | 'square'
    dashOffset?: number
    join?: 'bevel' | 'round' | 'miter'
  }
}

export class LineAppearance {
  @observable stroke: {
    color: string,
    alpha: number,
    width: number,
    cap: 'butt' | 'round' | 'square'
    dashOffset: number
    join: 'bevel' | 'round' | 'miter'
  } = {
    color: '#000000',
    alpha: 1,
    width: 1,
    cap: 'butt',
    dashOffset: 0,
    join: 'miter',
  }

  constructor(opts: LineAppearanceOpts) {
    Object.assign(this.stroke, opts.stroke)
  }

  static of(opts: LineAppearanceOpts = {}): LineAppearance {
    return new LineAppearance(opts)
  }
}
