import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { LineAppearance } from '../../../canvas/appearance/line_appearance'
import { ArrowGeometry } from '../../../canvas/geometry/arrow_geometry'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { LineGeometry } from '../../../canvas/geometry/line_geometry'
import { MarkerGeometry } from '../../../canvas/geometry/marker_geometry'
import { TextGeometry } from '../../../canvas/geometry/text_geometry'
import { Shape } from '../../../canvas/object/shape'
import { DashboardRobotModel } from './model'

export class DashboardRobotViewModel {
  public constructor(private model: DashboardRobotModel) {
  }

  public static of = createTransformer((model: DashboardRobotModel): DashboardRobotViewModel => {
    return new DashboardRobotViewModel(model)
  })

  @computed
  public get robot() {
    return [
      this.ballSight,
      this.kickTarget,
      this.ball,
      this.robotMarker,
    ]
  }

  @computed
  private get ball() {
    return Shape.of(
      CircleGeometry.of({
        radius: 0.1,
        x: this.model.ballWorldPosition.x,
        y: this.model.ballWorldPosition.y,
      }),
      BasicAppearance.of({
        fillStyle: this.model.ballColor,
        strokeStyle: 'transparent',
      }),
    )
  }

  @computed
  private get ballSight() {
    return Shape.of(
      LineGeometry.of({
        origin: this.model.robotPosition.clone(),
        target: this.model.ballWorldPosition.clone(),
      }),
      LineAppearance.of({
        lineWidth: 0.025,
        strokeStyle: this.model.ballSightColor,
      }),
    )
  }

  @computed
  private get kickTarget() {
    const origin = this.model.ballWorldPosition
    const difference = this.model.kickTarget.clone().subtract(origin)
    return Shape.of(
      ArrowGeometry.of({
        direction: difference.clone().divideScalar(difference.length), // TODO fix normalize???
        headLength: 0.3,
        headWidth: 0.15,
        length: difference.length,
        origin: origin.clone(),
        width: 0.025,
      }),
      BasicAppearance.of({
        fillStyle: this.model.kickTargetColor,
        lineWidth: 0,
        strokeStyle: 'transparent',
      }),
    )
  }

  @computed
  private get robotMarker() {
    const radius = 0.15
    return [
      Shape.of(
        MarkerGeometry.of({
          heading: this.model.robotHeading.clone(),
          radius,
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y,
        }),
        BasicAppearance.of({
          fillStyle: this.model.robotColor,
          lineWidth: 0.01,
          strokeStyle: this.model.robotBorderColor,
        }),
      ),
      Shape.of(
        TextGeometry.of({
          fontSize: '100%',
          text: this.model.id.toString(),
          textAlign: 'center',
          textBaseline: 'middle',
          maxWidth: radius,
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y,
        }),
        BasicAppearance.of({
          fillStyle: this.model.textColor,
          strokeStyle: 'transparent',
        }),
      ),
    ]
  }
}