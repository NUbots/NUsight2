import { computed, observable } from 'mobx'
import { createTransformer } from 'mobx-utils'

import { RobotModel } from '../robot/model'

export interface RobotSelectorViewModelOpts {
  robots: RobotModel[]
  selected?: RobotModel
}

export class RobotSelectorViewModel {
  @observable private robots: RobotModel[]
  @observable private selected?: RobotModel

  constructor(opts: RobotSelectorViewModelOpts) {
    this.robots = opts.robots
    this.selected = opts.selected
  }

  static of = createTransformer((opts: RobotSelectorViewModelOpts): RobotSelectorViewModel => {
    return new RobotSelectorViewModel(opts)
  })

  @computed
  get options() {
    return this.robots.map(robot => {
      return {
        id: robot.id,
        label: robot.name,
        robot,
      }
    })
  }

  @computed
  get selectedOption() {
    if (this.selected) {
      return {
        id: this.selected.id,
        label: this.selected.name,
        robot: this.selected,
      }
    }
  }
}
