import { observable } from 'mobx'

export class ColorSpaceVisualzerModel {
  @observable.ref public width: number
  @observable.ref public height: number

  constructor({ width, height }: { width: number, height: number }) {
    this.width = width
    this.height = height
  }

  public static of() {
    return new ColorSpaceVisualzerModel({
      width: 512,
      height: 512,
    })
  }
}
