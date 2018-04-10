import { observable } from 'mobx'

export class LineAppearance {
  @observable lineCap: 'butt' | 'round' | 'square'
  @observable lineDashOffset: number
  @observable lineJoin: 'bevel' | 'round' | 'miter'
  @observable lineWidth: number
  @observable strokeColor: number
  @observable strokeAlpha: number

  constructor(opts: LineAppearance) {
    this.lineCap = opts.lineCap
    this.lineDashOffset = opts.lineDashOffset
    this.lineJoin = opts.lineJoin
    this.lineWidth = opts.lineWidth
    this.strokeColor = opts.strokeColor
    this.strokeAlpha = opts.strokeAlpha
  }

  static of({
    lineCap = 'butt',
    lineDashOffset = 0,
    lineJoin = 'miter',
    lineWidth = 1,
    strokeColor = 0,
    strokeAlpha = 1,
  }: Partial<LineAppearance> = {}): LineAppearance {
    return new LineAppearance({
      lineCap,
      lineDashOffset,
      lineJoin,
      lineWidth,
      strokeColor,
      strokeAlpha,
    })
  }
}
