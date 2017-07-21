import { observable } from 'mobx'

export class LineAppearance {
  @observable public lineCap: 'butt' | 'round' | 'square'
  @observable public lineDashOffset: number
  @observable public lineJoin: 'bevel' | 'round' | 'miter'
  @observable public lineWidth: number
  @observable public strokeStyle: string

  constructor(opts: LineAppearance) {
    Object.assign(this, opts)
  }

  public static of(opts: Partial<LineAppearance> = {}): LineAppearance {
    return new LineAppearance({
      lineCap: opts.lineCap || 'butt',
      lineDashOffset: opts.lineDashOffset || 0,
      lineJoin: opts.lineJoin || 'miter',
      lineWidth: opts.lineWidth || 1,
      strokeStyle: opts.strokeStyle || '#000'
    })
  }
}
