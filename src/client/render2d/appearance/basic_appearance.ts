import { observable } from 'mobx'

export class BasicAppearance {
  @observable fillColor: number
  @observable fillAlpha: number
  @observable lineWidth: number
  @observable strokeColor: number
  @observable strokeAlpha: number

  constructor(opts: BasicAppearance) {
    this.fillColor = opts.fillColor
    this.fillAlpha = opts.fillAlpha
    this.lineWidth = opts.lineWidth
    this.strokeColor = opts.strokeColor
    this.strokeAlpha = opts.strokeAlpha
  }

  static of({
    fillColor = 0,
    fillAlpha = 1,
    lineWidth = 1,
    strokeColor = 0,
    strokeAlpha = 1,
  }: Partial<BasicAppearance> = {}): BasicAppearance {
    return new BasicAppearance({
      fillColor,
      fillAlpha,
      lineWidth,
      strokeColor,
      strokeAlpha,
    })
  }
}
