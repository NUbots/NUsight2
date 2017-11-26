import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { LineAppearance } from '../../../canvas/appearance/line_appearance'
import { ArcGeometry } from '../../../canvas/geometry/arc_geometry'
import { ArrowGeometry } from '../../../canvas/geometry/arrow_geometry'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { LineGeometry } from '../../../canvas/geometry/line_geometry'
import { MarkerGeometry } from '../../../canvas/geometry/marker_geometry'
import { TextGeometry } from '../../../canvas/geometry/text_geometry'
import { Group } from '../../../canvas/object/group'
import { Shape } from '../../../canvas/object/shape'
import { Transform } from '../../../math/transform'
import { Vector2 } from '../../../math/vector2'
import { DashboardRobotModel } from './model'

export class DashboardRobotViewModel {
  public constructor(private model: DashboardRobotModel) {
  }

  public static create = createTransformer((model: DashboardRobotModel): DashboardRobotViewModel => {
    return new DashboardRobotViewModel(model)
  })

  @computed
  public get robot(): Group {
    return Group.create({
      children: [
        this.fieldSpaceGroup,
        this.robotSpaceGroup,
      ],
    })
  }

  @computed
  get fieldSpaceGroup() {
    return Group.create({
      children: [
        this.ballSight,
        this.kickTarget,
        this.ball,
      ],
    })
  }

  @computed
  get robotSpaceGroup() {
    return Group.create({
      children: [
        this.walkCommand,
        this.robotMarker,
      ],
      transform: Transform.create({
        rotate: this.model.robotPosition.z,
        translate: {
          x: this.model.robotPosition.x,
          y: this.model.robotPosition.y,
        },
      }),
    })
  }

  @computed
  private get walkCommand() {
    const t = 2
    const translation = Vector2.from(this.model.walkCommand)
    const rotation = this.model.walkCommand.z
    const radius = translation.length / Math.abs(rotation)
    const origin = Vector2.create(-translation.y, translation.x).divideScalar(rotation)
    const arcLength = rotation * t
    const angle = Math.atan2(translation.y / rotation, translation.x / rotation) - Math.PI / 2

    const startAngle = angle
    const endAngle = startAngle + arcLength

    return Shape.create(
      ArcGeometry.create({
        origin,
        radius,
        startAngle,
        endAngle,
        anticlockwise: rotation < 0,
      }),
      BasicAppearance.create({
        lineWidth: 0.025,
        fillStyle: 'transparent',
        strokeStyle: '#000',
      }),
    )
  }

  @computed
  private get ball() {
    return Shape.create(
      CircleGeometry.create({
        radius: 0.1,
        x: this.model.ballPosition.x,
        y: this.model.ballPosition.y,
      }),
      BasicAppearance.create({
        fillStyle: this.model.ballColor,
        strokeStyle: 'transparent',
      }),
    )
  }

  @computed
  private get ballSight() {
    return Shape.create(
      LineGeometry.create({
        origin: Vector2.from(this.model.robotPosition),
        target: this.model.ballPosition.clone(),
      }),
      LineAppearance.create({
        lineWidth: 0.025,
        strokeStyle: this.model.ballSightColor,
      }),
    )
  }

  @computed
  private get kickTarget() {
    const origin = this.model.ballPosition
    const difference = this.model.kickTarget.clone().subtract(origin)
    return Shape.create(
      ArrowGeometry.create({
        direction: difference.clone().normalize(),
        headLength: 0.3,
        headWidth: 0.15,
        length: difference.length,
        origin: origin.clone(),
        width: 0.025,
      }),
      BasicAppearance.create({
        fillStyle: this.model.kickTargetColor,
        lineWidth: 0,
        strokeStyle: 'transparent',
      }),
    )
  }

  @computed
  private get robotMarker() {
    const radius = 0.15
    return Group.create({
      children: [
        Shape.create(
          MarkerGeometry.create({
            radius,
            x: 0,
            y: 0,
          }),
          BasicAppearance.create({
            fillStyle: this.model.robotColor,
            lineWidth: 0.01,
            strokeStyle: this.model.robotBorderColor,
          }),
        ),
        Shape.create(
          TextGeometry.create({
            text: this.model.playerId.toString(),
            textAlign: 'center',
            textBaseline: 'middle',
            maxWidth: radius,
            x: 0,
            y: 0,
          }),
          BasicAppearance.create({
            fillStyle: this.model.textColor,
            strokeStyle: 'transparent',
          }),
        ),
      ],
    })
  }
}
