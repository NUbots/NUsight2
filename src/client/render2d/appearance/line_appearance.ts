import { observable } from 'mobx'

export class LineAppearance {
  @observable lineCap: 'butt' | 'round' | 'square'
  @observable lineDashOffset: number
  @observable lineJoin: 'bevel' | 'round' | 'miter'
  @observable lineWidth: number
  @observable strokeStyle: string
  @observable nonScalingStroke: boolean

  constructor(opts: LineAppearance) {
    this.lineCap = opts.lineCap
    this.lineDashOffset = opts.lineDashOffset
    this.lineJoin = opts.lineJoin
    this.lineWidth = opts.lineWidth
    this.strokeStyle = opts.strokeStyle
    this.nonScalingStroke = opts.nonScalingStroke
  }

  static of({
    lineCap = 'butt',
    lineDashOffset = 0,
    lineJoin = 'miter',
    lineWidth = 1,
    strokeStyle = '#000',
    nonScalingStroke = false,
  }: Partial<LineAppearance> = {}): LineAppearance {
    return new LineAppearance({
      lineCap,
      lineDashOffset,
      lineJoin,
      lineWidth,
      strokeStyle,
      nonScalingStroke,
    })
  }
}
