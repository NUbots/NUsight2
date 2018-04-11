import { observable } from 'mobx'

import { FieldDimensions } from '../../../../shared/field/dimensions'

export class GroundModel {
  @observable bottomGoalColor: string
  @observable dimensions: FieldDimensions
  @observable fieldColor: string
  @observable lineColor: string
  @observable topGoalColor: string

  constructor(opts: GroundModel) {
    Object.assign(this, opts)
  }

  static of() {
    return new GroundModel({
      bottomGoalColor: '#0000ff',
      dimensions: FieldDimensions.postYear2017(),
      fieldColor: '#009688',
      lineColor: '#fff',
      topGoalColor: '#ffff00',
    })
  }
}
