import { computed } from 'mobx'
import { observable } from 'mobx'
import { memoize } from '../../../base/memoize'
import { Lut } from '../model'
import { ClassifierRobotModel } from '../model'

export class ColorSpaceVisualizerModel {
  @observable.ref public width: number
  @observable.ref public height: number

  constructor(private model: ClassifierRobotModel, { width, height }: {
    width: number,
    height: number
  }) {
    this.width = width
    this.height = height
  }

  public static of = memoize((model: ClassifierRobotModel): ColorSpaceVisualizerModel => {
    return new ColorSpaceVisualizerModel(model, {
      width: 512,
      height: 512,
    })
  })

  @computed
  get lut(): Lut {
    return this.model.lut
  }
}
