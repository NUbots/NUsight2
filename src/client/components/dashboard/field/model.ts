import { observable } from 'mobx'
import { GroundModel } from '../ground/model'

export class FieldModel {
  @observable public ground: GroundModel
  
  constructor(opts: FieldModel) {
    Object.assign(this, opts)
  }
  
  public static of(): FieldModel {
    return new FieldModel({
      ground: GroundModel.of()
    })
  }
}
