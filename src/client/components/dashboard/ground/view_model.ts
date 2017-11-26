import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { LineAppearance } from '../../../canvas/appearance/line_appearance'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { LineGeometry } from '../../../canvas/geometry/line_geometry'
import { PolygonGeometry } from '../../../canvas/geometry/polygon_geometry'
import { Group } from '../../../canvas/object/group'
import { Shape } from '../../../canvas/object/shape'
import { Vector2 } from '../../../math/vector2'
import { GroundModel } from './model'

export class GroundViewModel {
  public constructor(private model: GroundModel) {
  }

  public static create = createTransformer((model: GroundModel): GroundViewModel => {
    return new GroundViewModel(model)
  })

  @computed
  public get ground(): Group {
    return Group.create({
      children: [
        this.grass,
        this.goals,
        this.fieldLines,
      ],
    })
  }

  @computed
  private get grass() {
    const borderStripMinWidth = this.model.dimensions.borderStripMinWidth
    const goalDepth = this.model.dimensions.goalDepth
    const height = this.model.dimensions.fieldLength + (borderStripMinWidth * 2) + (goalDepth * 2)
    const width = this.model.dimensions.fieldWidth + (borderStripMinWidth * 2)
    const x = (-this.model.dimensions.fieldLength * 0.5) - goalDepth - borderStripMinWidth
    const y = (-this.model.dimensions.fieldWidth * 0.5) - borderStripMinWidth
    return Shape.create(
      this.getRectanglePolygon({ x, y, width, height }),
      BasicAppearance.create({
        fillStyle: this.model.fieldColor,
        lineWidth: 0,
        strokeStyle: 'transparent',
      }),
    )
  }

  @computed
  private get goals() {
    const dimensions = this.model.dimensions
    const width = dimensions.goalWidth
    const height = dimensions.goalDepth
    const y = -width * 0.5
    const goal = (x: number, strokeStyle: string) => Shape.create(
      this.getRectanglePolygon({ x, y, width, height }),
      BasicAppearance.create({
        fillStyle: 'transparent',
        lineWidth: dimensions.lineWidth,
        strokeStyle,
      }),
    )
    return Group.create({
      children: [
        goal(dimensions.fieldLength * 0.5, this.model.topGoalColor),
        goal((-dimensions.fieldLength * 0.5) - height, this.model.bottomGoalColor),
      ],
    })
  }

  @computed
  private get fieldLines() {
    return Group.create({
      children: [
        this.centerCircle,
        this.centerMark,
        this.halfwayLine,
        this.fieldBorder,
        this.goalAreas,
        this.penaltyMarkers,
      ],
    })
  }

  @computed
  private get centerCircle() {
    return Shape.create(
      CircleGeometry.create({ radius: this.model.dimensions.centerCircleDiameter * 0.5 }),
      BasicAppearance.create({
        fillStyle: 'transparent',
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      }),
    )
  }

  @computed
  private get centerMark() {
    const lineWidth = this.model.dimensions.lineWidth * 2
    const strokeStyle = this.model.lineColor
    return Group.create({
      children: [
        Shape.create(
          LineGeometry.create({
            origin: Vector2.create(0, lineWidth),
            target: Vector2.create(0, -lineWidth),
          }),
          LineAppearance.create({ lineWidth, strokeStyle }),
        ),
        Shape.create(
          LineGeometry.create({
            origin: Vector2.create(lineWidth, 0),
            target: Vector2.create(-lineWidth, 0),
          }),
          LineAppearance.create({ lineWidth, strokeStyle }),
        ),
      ],
    })
  }

  @computed
  private get halfwayLine() {
    return Shape.create(
      LineGeometry.create({
        origin: Vector2.create(0, this.model.dimensions.fieldWidth * 0.5),
        target: Vector2.create(0, -this.model.dimensions.fieldWidth * 0.5),
      }),
      LineAppearance.create({
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      }),
    )
  }

  @computed
  private get fieldBorder() {
    return Shape.create(
      this.getRectanglePolygon({
        x: -this.model.dimensions.fieldLength * 0.5,
        y: -this.model.dimensions.fieldWidth * 0.5,
        width: this.model.dimensions.fieldWidth,
        height: this.model.dimensions.fieldLength,
      }),
      BasicAppearance.create({
        fillStyle: 'transparent',
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      }),
    )
  }

  @computed
  private get goalAreas() {
    const fieldLength = this.model.dimensions.fieldLength
    const height = this.model.dimensions.goalAreaLength
    const width = this.model.dimensions.goalAreaWidth
    const y = -width * 0.5
    const goalArea = (x: number) => Shape.create(
      this.getRectanglePolygon({ x, y, width, height }),
      BasicAppearance.create({
        fillStyle: 'transparent',
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
      }),
    )
    return Group.create({
      children: [
        goalArea((fieldLength * 0.5) - height),
        goalArea(-fieldLength * 0.5),
      ],
    })
  }

  @computed
  private get penaltyMarkers() {
    const fieldLength = this.model.dimensions.fieldLength
    const penaltyMarkDistance = this.model.dimensions.penaltyMarkDistance
    const lineWidth = this.model.dimensions.lineWidth
    const marker = (x: number) => Group.create({
      children: [
        Shape.create(
          LineGeometry.create({
            origin: Vector2.create(x + lineWidth, 0),
            target: Vector2.create(x - lineWidth, 0),
          }),
          LineAppearance.create({
            lineWidth,
            strokeStyle: this.model.lineColor,
          }),
        ),
        Shape.create(
          LineGeometry.create({
            origin: Vector2.create(x, lineWidth),
            target: Vector2.create(x, -lineWidth),
          }),
          LineAppearance.create({
            lineWidth,
            strokeStyle: this.model.lineColor,
          }),
        ),
      ],
    })
    return Group.create({
      children: [
        marker((fieldLength * 0.5) - penaltyMarkDistance),
        marker(-(fieldLength * 0.5) + penaltyMarkDistance),
      ],
    })
  }

  private getRectanglePolygon(opts: { x: number, y: number, width: number, height: number }): PolygonGeometry {
    // Width is defined along the positive y axis (across the field), and height along the positive x axis (along the
    // field). This matches the field definitions model.
    return PolygonGeometry.create([
      Vector2.create(opts.x, opts.y), // Bottom right
      Vector2.create(opts.x, opts.y + opts.width), // Bottom left
      Vector2.create(opts.x + opts.height, opts.y + opts.width), // Top left
      Vector2.create(opts.x + opts.height, opts.y), // Top right
    ])
  }
}
