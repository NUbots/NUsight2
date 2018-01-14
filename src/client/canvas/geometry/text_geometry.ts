import { observable } from 'mobx'

import { Transform } from '../../math/transform'

export class TextGeometry {
  @observable public alignToView: boolean
  @observable public fontFamily: string
  @observable public maxWidth: number
  @observable public text: string
  @observable public textAlign: 'start' | 'middle' | 'end' | 'left' | 'right' | 'center'
  @observable public textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  @observable public x: number
  @observable public y: number

  constructor(opts: TextGeometry) {
    this.alignToView = opts.alignToView
    this.fontFamily = opts.fontFamily
    this.maxWidth = opts.maxWidth
    this.text = opts.text
    this.textAlign = opts.textAlign
    this.textBaseline = opts.textBaseline
    this.x = opts.x
    this.y = opts.y
  }

  public static of({
    alignToView = true,
    fontFamily = 'sans-serif',
    maxWidth = 0.5,
    text = '',
    textAlign = 'start',
    textBaseline = 'alphabetic',
    x = 0,
    y = 0,
  }: Partial<TextGeometry> = {}): TextGeometry {
    return new TextGeometry({
      alignToView,
      fontFamily,
      maxWidth,
      text,
      textAlign,
      textBaseline,
      x,
      y,
    })
  }
}
