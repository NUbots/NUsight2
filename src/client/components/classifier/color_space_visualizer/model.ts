import { computed } from 'mobx'
import { observable } from 'mobx'

import { memoize } from '../../../base/memoize'
import { Lut } from '../model'
import { ClassifierRobotModel } from '../model'

export class ColorSpaceVisualizerModel {
  @observable.ref width: number
  @observable.ref height: number
  @observable.shallow camera: { distance: number, elevation: number, azimuth: number }

  constructor(private model: ClassifierRobotModel, { width, height, camera }: {
    width: number,
    height: number
    camera: { distance: number, elevation: number, azimuth: number }
  }) {
    this.width = width
    this.height = height
    this.camera = camera
  }

  static of = memoize((model: ClassifierRobotModel): ColorSpaceVisualizerModel => {
    return new ColorSpaceVisualizerModel(model, {
      width: 512,
      height: 512,
      camera: {
        distance: 3,
        elevation: 0,
        azimuth: 0,
      },
    })
  })

  @computed
  get lut(): Lut {
    return this.model.lut
  }
}
