import { observable } from 'mobx'
import { Object2d } from '../object/object2d'

export class TextGeometry implements Object2d {
  @observable public fontFamily: string
  @observable public fontSize: string
  @observable public maxWidth: number
  @observable public rotate: number
  @observable public scale: { x: number, y: number }
  @observable public text: string
  @observable public textAlign: 'start' | 'end' | 'left' | 'right' | 'center'
  @observable public textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
  @observable public translate: { x: number, y: number }
  @observable public x: number
  @observable public y: number

  constructor(opts: TextGeometry) {
    this.fontFamily = opts.fontFamily
    this.fontSize = opts.fontSize
    this.maxWidth = opts.maxWidth
    this.rotate = opts.rotate
    this.scale = opts.scale
    this.text = opts.text
    this.textAlign = opts.textAlign
    this.textBaseline = opts.textBaseline
    this.translate = opts.translate
    this.x = opts.x
    this.y = opts.y
  }
  
  public static of(opts: Partial<TextGeometry>) {
    return new TextGeometry({
      fontFamily: opts.fontFamily || 'sans-serif',
      fontSize: opts.fontSize || '10px',
      maxWidth: opts.maxWidth || -1,
      rotate: opts.rotate || 0,
      scale: opts.scale || { x: 1, y: 1 },
      text: opts.text || '',
      textAlign: opts.textAlign || 'start',
      textBaseline: opts.textBaseline || 'alphabetic',
      translate: opts.translate || { x: 0, y: 0 },
      x: opts.x || 0,
      y: opts.y || 0
    })
  }
}
