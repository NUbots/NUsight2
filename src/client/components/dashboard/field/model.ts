import { computed } from 'mobx'
import { observable } from 'mobx'
import { DashboardRobotModel } from '../dashboard_robot/model'
import { GroundModel } from '../ground/model'

export type FieldModelOpts = {
  ground: GroundModel
  robots: DashboardRobotModel[]
}

export class FieldModel {
  @observable public ground: GroundModel
  @observable public robots: DashboardRobotModel[]

  constructor(opts: FieldModelOpts) {
    Object.assign(this, opts)
  }

  public static of(robots: DashboardRobotModel[]): FieldModel {
    return new FieldModel({
      ground: GroundModel.of(),
      robots
    })
  }

  @computed
  public get fieldLength() {
    return this.ground.dimensions.fieldLength + (this.ground.dimensions.goalDepth * 2)
  }

  @computed
  public get fieldWidth() {
    return this.ground.dimensions.fieldWidth
  }
}
