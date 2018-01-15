import { createTransformer } from 'mobx'
import { computed } from 'mobx'

import { Transform } from '../../../math/transform'
import { Group } from '../../../toodee/object/group'
import { DashboardRobotViewModel } from '../dashboard_robot/view_model'
import { GroundViewModel } from '../ground/view_model'

import { FieldModel } from './model'

export class FieldViewModel {
  constructor(private model: FieldModel) {
  }

  static of = createTransformer((model: FieldModel): FieldViewModel => {
    return new FieldViewModel(model)
  })

  @computed
  get scene(): Group {
    return Group.of({
      transform: Transform.of({
        // TODO (Annable): move camera to the view model and put this transform there.
        rotate: this.model.orientation === 'left' ? Math.PI : 0,
      }),
      children: [
        this.ground,
        this.robots,
      ],
    })
  }

  @computed
  get camera(): Transform {
    return Transform.of({
      scale: { x: 1.0 / this.model.fieldLength, y: 1.0 / this.model.fieldLength },
      translate: { x: -this.model.fieldLength * 0.5, y: -this.model.fieldWidth * 0.5 },
    })
  }

  @computed
  get aspectRatio(): number {
    return this.model.fieldLength / this.model.fieldWidth
  }

  @computed
  private get ground() {
    return GroundViewModel.of(this.model.ground).ground
  }

  @computed
  private get robots() {
    return Group.of({
      children: this.model.robots
        .filter(robot => robot.enabled && robot.connected)
        .map(robot => DashboardRobotViewModel.of(robot).robot),
    })
  }
}
