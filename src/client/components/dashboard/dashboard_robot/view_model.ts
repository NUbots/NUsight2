import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { LineAppearance } from '../../../canvas/appearance/line_appearance'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { LineGeometry } from '../../../canvas/geometry/line_geometry'
import { MarkerGeometry } from '../../../canvas/geometry/marker_geometry'
import { TextGeometry } from '../../../canvas/geometry/text_geometry'
import { Shape } from '../../../canvas/object/shape'
import { Vector2 } from '../../../math/vector2'
import { DashboardRobotModel } from './model'

export class DashboardRobotViewModel {
  public constructor(private model: DashboardRobotModel) {}

  public static of = createTransformer((model: DashboardRobotModel): DashboardRobotViewModel => {
    return new DashboardRobotViewModel(model)
  })

  @computed
  public get robot() {
    return [
      this.ballSight,
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
  private get ballSight() {
    return Shape.of(
      LineGeometry.of({
        origin: Vector2.of(this.model.robotPosition.x, this.model.robotPosition.y),
        target: Vector2.of(this.model.ballWorldPosition.x, this.model.ballWorldPosition.y)
      }),
      LineAppearance.of({
        lineWidth: 0.025,
        strokeStyle: this.model.ballSightColor
      })
    )
  }

  @computed
  private get robotMarker() {
    return [
      Shape.of(
        MarkerGeometry.of({
          heading: this.model.robotHeading.clone(),
          radius: 0.15,
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y
        }),
        BasicAppearance.of({
          fillStyle: this.model.robotColor,
          lineWidth: 0.01,
          strokeStyle: this.model.robotBorderColor
        })
      ),

      Shape.of(
        TextGeometry.of({
          text: this.model.id.toString(),
          textAlign: 'center',
          textBaseline: 'middle',
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y
        }),
        BasicAppearance.of({
          fillStyle: this.model.textColor,
          strokeStyle: 'transparent'
        })
      )
    ]
  }
}
