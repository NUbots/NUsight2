import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { TextGeometry } from '../../../canvas/geometry/text_geometry'
import { Shape } from '../../../canvas/object/shape'
import { DashboardRobotModel } from './model'

export class DashboardRobotViewModel {
  public constructor(private model: DashboardRobotModel) {}

  public static of = createTransformer((model: DashboardRobotModel): DashboardRobotViewModel => {
    return new DashboardRobotViewModel(model)
  })

  @computed
  public get robot() {
    return [
      this.ball,
      this.robotMarker
    ]
  }

  @computed
  private get ball() {
    return Shape.of(
      CircleGeometry.of({
        radius: 0.1,
        x: this.model.ballWorldPosition.x,
        y: this.model.ballWorldPosition.y
      }),
      BasicAppearance.of({
        fillStyle: this.model.ballColor,
        strokeStyle: 'transparent'
      })
    )
  }

  @computed
  private get robotMarker() {
    return [
      Shape.of(
        CircleGeometry.of({
          radius: 0.15,
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y
        }),
        BasicAppearance.of({
          fillStyle: this.model.robotColor,
          strokeStyle: 'transparent'
        })
      ),
      Shape.of(
        TextGeometry.of({
          text: this.model.id.toString(),
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y
        }),
        BasicAppearance.of({
          fillStyle: '#fff',
          strokeStyle: 'transparent'
        })
      )
    ]
  }
}
