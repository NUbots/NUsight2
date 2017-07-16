import { observable } from 'mobx'
import { FieldDimensions } from '../../../../shared/field/dimensions'

export class GroundModel {
  @observable public bottomGoalColor: string
  @observable public dimensions: FieldDimensions
  @observable public lineColor: string
  @observable public topGoalColor: string

  public constructor(opts: GroundModel) {
    Object.assign(this, opts)
  }

  public static of() {
    return new GroundModel({
      bottomGoalColor: 'yellow',
      dimensions: FieldDimensions.postYear2017(),
      lineColor: '#fff',
      topGoalColor: 'blue',
    })
  }
}
