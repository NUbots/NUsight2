import { observable } from 'mobx'
import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { RobotNetworkStatsModel } from '../../../network/robot_network_stats_model'
import { RobotModel } from '../../robot/model'

export class RobotLabelViewModel {
  @observable statsOpen = false

  constructor(private robotModel: RobotModel) {
  }

  static of = createTransformer((robotModel: RobotModel): RobotLabelViewModel => {
    return new RobotLabelViewModel(robotModel)
  })

  @computed
  get stats() {
    return RobotNetworkStatsModel.of(this.robotModel)
  }
}
