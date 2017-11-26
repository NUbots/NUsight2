import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Group } from '../../../canvas/object/group'
import { Transform } from '../../../math/transform'
import { DashboardRobotViewModel } from '../dashboard_robot/view_model'
import { GroundViewModel } from '../ground/view_model'
import { FieldModel } from './model'

export class FieldViewModel {
  public constructor(private model: FieldModel) {
  }

  public static create = createTransformer((model: FieldModel): FieldViewModel => {
    return new FieldViewModel(model)
  })

  @computed
  public get scene(): Group {
    return Group.create({
      transform: Transform.create({
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
  private get ground() {
    return GroundViewModel.create(this.model.ground).ground
  }

  @computed
  private get robots() {
    return Group.create({
      children: this.model.robots
        .filter(robot => robot.enabled && robot.connected)
        .map(robot => DashboardRobotViewModel.create(robot).robot),
    })
  }
}
