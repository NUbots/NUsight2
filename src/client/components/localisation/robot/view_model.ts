import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Object3D } from 'three'
import { Quaternion } from 'three'

import { DarwinBodyViewModel } from './darwin/body/view_model'
import { IgusBodyViewModel } from './igus/body/view_model'
import { LocalisationRobotModel } from './model'

export const HIP_TO_FOOT = 0.2465

export class RobotViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): RobotViewModel => {
    return new RobotViewModel(model)
  })

  @computed
  get robot(): Object3D {
    const robot = new Object3D()
    robot.position.x = this.model.rWTt.x
    robot.position.y = this.model.rWTt.y
    robot.position.z = this.model.rWTt.z
    const rotation = new Quaternion(this.model.Rwt.x, this.model.Rwt.y, this.model.Rwt.z, this.model.Rwt.w)
    robot.setRotationFromQuaternion(rotation)
    if (this.model.name.match(/darwin\d/)) {
      robot.add(DarwinBodyViewModel.of(this.model).body)
    } else {
      robot.add(IgusBodyViewModel.of(this.model).body)
    }
    return robot
  }
}
