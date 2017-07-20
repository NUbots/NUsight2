import { observable } from 'mobx'

export class TextGeometry {
  @observable public font: string
  @observable public maxWidth: number
  @observable public text: string
  @observable public textAlign: 'start' | 'end' | 'left' | 'right' | 'center'
  @observable public textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  @observable public x: number
  @observable public y: number

  constructor(opts: TextGeometry) {
    this.font = opts.font
    this.maxWidth = opts.maxWidth
    this.text = opts.text
    this.textAlign = opts.textAlign
    this.textBaseline = opts.textBaseline
    this.x = opts.x
    this.y = opts.y
  }
  
  public static of(opts: Partial<TextGeometry>) {
    return new TextGeometry({
      font: opts.font || '10px sans-serif',
      maxWidth: opts.maxWidth || -1,
      text: opts.text || '',
      textAlign: opts.textAlign || 'start',
      textBaseline: opts.textBaseline || 'alphabetic',
      x: opts.x || 0,
      y: opts.y || 0
    })
  }
}
