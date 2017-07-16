import { computed } from 'mobx'
import { observable } from 'mobx'
import { GroundModel } from '../ground/model'

export type FieldModelOpts = {
  ground: GroundModel
}

export class FieldModel {
  @observable public ground: GroundModel

  constructor(opts: FieldModelOpts) {
    Object.assign(this, opts)
  }

  public static of(): FieldModel {
    return new FieldModel({
      ground: GroundModel.of()
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
