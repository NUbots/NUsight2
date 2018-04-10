import { observable } from 'mobx'

import { FieldDimensions } from '../../../../shared/field/dimensions'

export class GroundModel {
  @observable bottomGoalColor: number
  @observable dimensions: FieldDimensions
  @observable fieldColor: number
  @observable lineColor: number
  @observable topGoalColor: number

  constructor(opts: GroundModel) {
    Object.assign(this, opts)
  }

  static of() {
    return new GroundModel({
      bottomGoalColor: 0x0000FF,
      dimensions: FieldDimensions.postYear2017(),
      fieldColor: 0x009688,
      lineColor: 0xffffff,
      topGoalColor: 0xffff00,
    })
  }
}
