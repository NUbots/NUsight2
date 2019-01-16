import * as bounds from 'binary-search-bounds'
import { computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { RobotViewModel } from '../../localisation/darwin_robot/view_model'
import { RobotModel } from '../../robot/model'
import { Frame, ScriptTunerModel } from '../model'

export class ViewerViewModel {
  constructor(private model: ScriptTunerModel) {
  }

  static of = createTransformer((model: ScriptTunerModel): ViewerViewModel => {
    return new ViewerViewModel(model)
  })

  @computed
  get robotViewModel() {
    // console.log('robotViewModel recomputed, headPan', this.model.currentRobotModel.motors.headPan.angle)
    return RobotViewModel.of(this.model.currentRobotModel)
  }
}
