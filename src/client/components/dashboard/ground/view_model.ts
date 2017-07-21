import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { LineAppearance } from '../../../canvas/appearance/line_appearance'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { LineGeometry } from '../../../canvas/geometry/line_geometry'
import { RectangleGeometry } from '../../../canvas/geometry/rectangle_geometry'
import { Shape } from '../../../canvas/object/shape'
import { Vector2 } from '../../../math/vector2'
import { GroundModel } from './model'

export class GroundViewModel {
  public constructor(private model: GroundModel) {}

  public static of = createTransformer((model: GroundModel): GroundViewModel => {
    return new GroundViewModel(model)
  })

  @computed
  public get ground() {
    return [
      this.grass,
      this.goals,
      this.fieldLines
    ]
  }

  @computed
  private get grass() {
    const borderStripMinWidth = this.model.dimensions.borderStripMinWidth
    const goalDepth = this.model.dimensions.goalDepth
    return Shape.of(
      RectangleGeometry.of({
        height: this.model.dimensions.fieldLength + (borderStripMinWidth * 2) + (goalDepth * 2),
        width: this.model.dimensions.fieldWidth + (borderStripMinWidth * 2),
        x: (this.model.dimensions.fieldLength * 0.5) + borderStripMinWidth + goalDepth,
        y: this.model.dimensions.fieldWidth * 0.5 + borderStripMinWidth
      }),
      BasicAppearance.of({
        fillStyle: this.model.fieldColor,
        lineWidth: 0,
        strokeStyle: 'transparent'
      })
    )
  }

  @computed
  private get goals() {
    const dimensions = this.model.dimensions
    const width = dimensions.goalWidth
    const height = dimensions.goalDepth
    const y = width * 0.5
    const goal = (x: number, strokeStyle: string) => Shape.of(
      RectangleGeometry.of({ height, width, x, y }),
      BasicAppearance.of({
        fillStyle: 'transparent',
        lineWidth: dimensions.lineWidth,
        strokeStyle
      })
    )
    return [
      goal((dimensions.fieldLength * 0.5) + height, this.model.topGoalColor),
      goal(-dimensions.fieldLength * 0.5, this.model.bottomGoalColor)
    ]
  }

  @computed
  private get fieldLines() {
    return [
      this.centerCircle,
      this.centerMark,
      this.halfwayLine,
      this.fieldBorder,
      this.goalAreas,
      this.penaltyMarkers
    ]
  }

  @computed
  private get centerCircle() {
    return Shape.of(
      CircleGeometry.of({ radius: this.model.dimensions.centerCircleDiameter * 0.5 }),
      BasicAppearance.of({
        fillStyle: 'transparent',
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      })
    )
  }

  @computed
  private get centerMark() {
    const lineWidth = this.model.dimensions.lineWidth * 2
    const strokeStyle = this.model.lineColor
    return [
      Shape.of(
        LineGeometry.of({
          origin: Vector2.of(0, lineWidth),
          target: Vector2.of(0, -lineWidth)
        }),
        LineAppearance.of({ lineWidth, strokeStyle })
      ),
      Shape.of(
        LineGeometry.of({
          origin: Vector2.of(lineWidth, 0),
          target: Vector2.of(-lineWidth, 0)
        }),
        LineAppearance.of({ lineWidth, strokeStyle })
      )
    ]
  }

  @computed
  private get halfwayLine() {
    return Shape.of(
      LineGeometry.of({
        origin: Vector2.of(0, this.model.dimensions.fieldWidth * 0.5),
        target: Vector2.of(0, -this.model.dimensions.fieldWidth * 0.5)
      }),
      LineAppearance.of({
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      })
    )
  }

  @computed
  private get fieldBorder() {
    return Shape.of(
      RectangleGeometry.of({
        height: this.model.dimensions.fieldLength,
        width: this.model.dimensions.fieldWidth,
        x: this.model.dimensions.fieldLength * 0.5,
        y: this.model.dimensions.fieldWidth * 0.5
      }),
      BasicAppearance.of({
        fillStyle: 'transparent',
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      })
    )
  }

  @computed
  private get goalAreas() {
    const fieldLength = this.model.dimensions.fieldLength
    const width = this.model.dimensions.goalAreaWidth
    const height = this.model.dimensions.goalAreaLength
    const goalArea = (x: number) => Shape.of(
      RectangleGeometry.of({ height, width, x, y: width * 0.5 }),
      BasicAppearance.of({
        fillStyle: 'transparent',
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      })
    )
    return [
      goalArea(fieldLength * 0.5),
      goalArea((-fieldLength * 0.5) + height)
    ]
  }

  @computed
  private get penaltyMarkers() {
    const fieldLength = this.model.dimensions.fieldLength
    const penaltyMarkDistance = this.model.dimensions.penaltyMarkDistance
    const lineWidth = this.model.dimensions.lineWidth
    const marker = (x: number) => [
      Shape.of(
        LineGeometry.of({
          origin: Vector2.of(x + lineWidth, 0),
          target: Vector2.of(x - lineWidth, 0)
        }),
        LineAppearance.of({
          lineWidth,
          strokeStyle: this.model.lineColor
        })
      ),
      Shape.of(
        LineGeometry.of({
          origin: Vector2.of(x, lineWidth),
          target: Vector2.of(x, -lineWidth)
        }),
        LineAppearance.of({
          lineWidth,
          strokeStyle: this.model.lineColor
        })
      )
    ]
    return [
      marker((fieldLength * 0.5) - penaltyMarkDistance),
      marker(-(fieldLength * 0.5) + penaltyMarkDistance)
    ]
  }
}
