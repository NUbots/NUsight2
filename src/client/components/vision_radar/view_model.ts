import { createTransformer } from 'mobx'
import { VisionRadarModel } from './model'

export class VisionRadarViewModel {
  constructor(private model: VisionRadarModel) {
  }

  public static of = createTransformer((model: VisionRadarModel): VisionRadarViewModel => {
    return new VisionRadarViewModel(model)
  })
}
