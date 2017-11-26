import { observable } from 'mobx'

export class ColorSpaceVisualzerModel {
  @observable.ref width: number
  @observable.ref height: number

  constructor({ width, height }: { width: number, height: number }) {
    this.width = width
    this.height = height
  }

  static of() {
    return new ColorSpaceVisualzerModel({
      width: 512,
      height: 512,
    })
  }
}
