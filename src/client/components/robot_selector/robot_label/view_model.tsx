import { observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { RobotModel } from '../../robot/model'

export class RobotLabelViewModel {
  @observable statsOpen = false

  constructor(private model: RobotModel) {
  }

  static of = createTransformer((model: RobotModel): RobotLabelViewModel => {
    return new RobotLabelViewModel(model)
  })
}
