import { observable } from 'mobx'

import { Lut } from '../lut'

export type Image
  = { readonly type: 'data', readonly data: Uint8Array }
  | { readonly type: 'image', readonly image: HTMLImageElement }

export class ClassifiedImageModel {
  @observable.ref image?: Image
  @observable.ref lut: Lut

  constructor({ lut }: { lut: Lut }) {
    this.lut = lut
  }

  static of({ lut }: { lut: Lut }) {
    return new ClassifiedImageModel({ lut })
  }
}
