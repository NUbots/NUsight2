import { observable } from 'mobx'
import { AppModel } from '../app/model'
import { memoize } from '../../base/memoize'

export class VisionRadarModel {
  @observable ringSegments: number[]

  constructor(private appModel: AppModel, { ringSegments }: { ringSegments: number[] }) {
    this.ringSegments = ringSegments
  }

  public static of = memoize((appModel: AppModel): VisionRadarModel => {
    return new VisionRadarModel(appModel, {
      ringSegments: [],
    })
  })
}
