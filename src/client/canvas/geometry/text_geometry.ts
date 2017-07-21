import { observable } from 'mobx'

export class TextGeometry {
  @observable public fontFamily: string
  @observable public fontSize: string
  @observable public maxWidth: number
  @observable public text: string
  @observable public textAlign: 'start' | 'end' | 'left' | 'right' | 'center'
  @observable public textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  @observable public x: number
  @observable public y: number

  constructor(opts: TextGeometry) {
    this.fontFamily = opts.fontFamily
    this.fontSize = opts.fontSize
    this.maxWidth = opts.maxWidth
    this.text = opts.text
    this.textAlign = opts.textAlign
    this.textBaseline = opts.textBaseline
    this.x = opts.x
    this.y = opts.y
  }
  
  public static of(opts: Partial<TextGeometry>) {
    return new TextGeometry({
      fontFamily: opts.fontFamily || 'sans-serif',
      fontSize: opts.fontSize || '10px',
      maxWidth: opts.maxWidth || -1,
      text: opts.text || '',
      textAlign: opts.textAlign || 'start',
      textBaseline: opts.textBaseline || 'alphabetic',
      x: opts.x || 0,
      y: opts.y || 0
    })
  }
}
