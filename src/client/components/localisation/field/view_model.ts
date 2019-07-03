import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { PlaneGeometry } from 'three'
import { Matrix4 } from 'three'
import { MeshBasicMaterial } from 'three'
import { RingGeometry } from 'three'
import { Object3D } from 'three'
import { Mesh } from 'three'
import { Geometry } from 'three'

import { FieldModel } from './model'

export class FieldViewModel {
  constructor(private model: FieldModel) {
  }

  static of = createTransformer((model: FieldModel): FieldViewModel => {
    return new FieldViewModel(model)
  })

  @computed
  get field() {
    const field = new Object3D()
    field.add(this.ground)
    field.add(this.fieldLines)
    return field
  }

  @computed
  private get ground() {
    return new Mesh(this.groundGeometry, this.groundMaterial)
  }

  @computed
  private get groundGeometry(): Geometry {
    const dimensions = this.model.dimensions
    const { fieldLength, fieldWidth, borderStripMinWidth, goalDepth } = dimensions
    return new PlaneGeometry(
      fieldLength + goalDepth * 2 + borderStripMinWidth * 2,
      fieldWidth + borderStripMinWidth * 2,
    )
  }

  @computed
  private get groundMaterial() {
    const material = new MeshBasicMaterial({ color: this.model.fieldColor })
    material.polygonOffset = true
    material.polygonOffsetFactor = -2
    material.polygonOffsetUnits = 1
    return material
  }

  @computed
  private get fieldLines() {
    return new Mesh(this.fieldLinesGeometry, this.fieldLinesMaterial)
  }

  @computed
  private get fieldLinesGeometry() {
    const geometry = new Geometry()
    const centerCircle = this.centerCircle

    const fieldWidth = this.model.dimensions.fieldWidth
    const fieldLength = this.model.dimensions.fieldLength
    const lineWidth = this.model.dimensions.lineWidth
    const goalAreaWidth = this.model.dimensions.goalAreaWidth
    const goalAreaLength = this.model.dimensions.goalAreaLength
    const goalDepth = this.model.dimensions.goalDepth
    const goalWidth = this.model.dimensions.goalWidth
    const penaltyMarkDistance = this.model.dimensions.penaltyMarkDistance

    const halfLength = fieldLength * 0.5
    const halfWidth = fieldWidth * 0.5
    const halfGoalAreaWidth = goalAreaWidth * 0.5
    const halfGoalWidth = goalWidth * 0.5

    const blueHalf = this.buildRectangle(-halfLength, -halfWidth, halfLength, fieldWidth, lineWidth)
    const blueHalfGoalArea = this.buildRectangle(
      -halfLength,
      -halfGoalAreaWidth,
      goalAreaLength,
      goalAreaWidth,
      lineWidth)
    const blueHalfGoal = this.buildRectangle(-halfLength - goalDepth, -halfGoalWidth, goalDepth, goalWidth, lineWidth)
    const blueHalfPenaltyMark = this.buildRectangle(-halfLength + penaltyMarkDistance, 0, 0, 0, lineWidth)

    const yellowHalf = this.buildRectangle(0, -halfWidth, halfLength, fieldWidth, lineWidth)
    const yellowHalfGoalArea = this.buildRectangle(
      halfLength - goalAreaLength,
      -halfGoalAreaWidth,
      goalAreaLength,
      goalAreaWidth,
      lineWidth)
    const yellowHalfGoal = this.buildRectangle(halfLength, -halfGoalWidth, goalDepth, goalWidth, lineWidth)
    const yellowHalfPenaltyMark = this.buildRectangle(halfLength - penaltyMarkDistance, 0, 0, 0, lineWidth)

    const identity = new Matrix4()
    geometry.merge(centerCircle, identity)
    geometry.merge(blueHalf, identity)
    geometry.merge(blueHalfGoalArea, identity)
    geometry.merge(blueHalfGoal, identity)
    geometry.merge(blueHalfPenaltyMark, identity)
    geometry.merge(yellowHalf, identity)
    geometry.merge(yellowHalfGoalArea, identity)
    geometry.merge(yellowHalfGoal, identity)
    geometry.merge(yellowHalfPenaltyMark, identity)

    return geometry
  }

  @computed
  private get centerCircle() {
    return new RingGeometry(
      (this.model.dimensions.centerCircleDiameter - this.model.dimensions.lineWidth) * 0.5,
      (this.model.dimensions.centerCircleDiameter + this.model.dimensions.lineWidth) * 0.5,
      128,
    )
  }

  @computed
  private get fieldLinesMaterial() {
    const material = new MeshBasicMaterial({ color: this.model.lineColor })
    material.polygonOffset = true
    material.polygonOffsetFactor = -3
    material.polygonOffsetUnits = 1
    return material
  }

  private buildRectangle(x: number, y: number, w: number, h: number, lw: number) {
    const x1 = x - lw * 0.5
    const x2 = x + w + lw * 0.5

    const topLine = this.buildHorizontalLine(x1, x2, y, lw)
    const bottomLine = this.buildHorizontalLine(x1, x2, y + h, lw)

    const leftLine = this.buildVerticalLine(y, y + h, x, lw)
    const rightLine = this.buildVerticalLine(y, y + h, x + w, lw)

    const identity = new Matrix4()
    const rect = new Geometry()
    rect.merge(topLine, identity)
    rect.merge(bottomLine, identity)
    rect.merge(leftLine, identity)
    rect.merge(rightLine, identity)
    return rect
  }

  private buildHorizontalLine(x1: number, x2: number, y: number, width: number) {
    const length = x2 - x1
    const hLine = new PlaneGeometry(length, width)
    hLine.applyMatrix(new Matrix4().makeTranslation(x1 + length * 0.5, y, 0))
    return hLine
  }

  private buildVerticalLine(y1: number, y2: number, x: number, width: number) {
    const length = y2 - y1
    const vLine = new PlaneGeometry(width, length)
    vLine.applyMatrix(new Matrix4().makeTranslation(x, y1 + length * 0.5, 0))
    return vLine
  }
}
