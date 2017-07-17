import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Vector2 } from '../../../math/vector2'
import { CircleProps } from '../canvas_renderer/renderer'
import { LineProps } from '../canvas_renderer/renderer'
import { RectangleProps } from '../canvas_renderer/renderer'
import { GroundModel } from './model'

export class GroundViewModel {
  public constructor(private model: GroundModel) {}

  public static of = createTransformer((model: GroundModel): GroundViewModel => {
    return new GroundViewModel(model)
  })

  @computed
  public get ground() {
    return [
      this.goals,
      this.fieldLines
    ]
  }

  @computed
  private get goals(): RectangleProps[] {
    const dimensions = this.model.dimensions
    const width = dimensions.goalWidth
    const height = dimensions.goalDepth
    const y = width * 0.5
    return [
      {
        height,
        lineWidth: dimensions.lineWidth,
        strokeStyle: this.model.topGoalColor,
        type: 'rectangle',
        width,
        x: (dimensions.fieldLength * 0.5) + height,
        y
      },
      {
        height,
        lineWidth: dimensions.lineWidth,
        strokeStyle: this.model.bottomGoalColor,
        type: 'rectangle',
        width,
        x: -dimensions.fieldLength * 0.5,
        y
      }
    ]
  }

  @computed
  private get fieldLines() {
    return [
      this.centerCircle,
      this.centerLine,
      this.fieldBorder,
      this.goalAreas
    ]
  }

  @computed
  private get centerCircle(): CircleProps {
    return {
      lineWidth: this.model.dimensions.lineWidth,
      radius: this.model.dimensions.centerCircleDiameter * 0.5,
      strokeStyle: this.model.lineColor,
      type: 'circle',
      x: 0,
      y: 0
    }
  }

  @computed
  private get centerLine(): LineProps {
    return {
      lineWidth: this.model.dimensions.lineWidth,
      origin: Vector2.of(0, this.model.dimensions.fieldWidth * 0.5),
      strokeStyle: this.model.lineColor,
      target: Vector2.of(0, -this.model.dimensions.fieldWidth * 0.5),
      type: 'line'
    }
  }

  @computed
  private get fieldBorder(): RectangleProps {
    return {
      height: this.model.dimensions.fieldLength,
      lineWidth: this.model.dimensions.lineWidth,
      strokeStyle: this.model.lineColor,
      type: 'rectangle',
      width: this.model.dimensions.fieldWidth,
      x: this.model.dimensions.fieldLength * 0.5,
      y: this.model.dimensions.fieldWidth * 0.5
    }
  }

  @computed
  private get goalAreas(): RectangleProps[] {
    const width = this.model.dimensions.goalAreaWidth
    const height = this.model.dimensions.goalAreaLength
    return [
      {
        height,
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
        type: 'rectangle',
        width,
        x: this.model.dimensions.fieldLength * 0.5,
        y: width * 0.5
      },
      {
        height,
        lineWidth: this.model.dimensions.lineWidth,
        strokeStyle: this.model.lineColor,
        type: 'rectangle',
        width,
        x: -this.model.dimensions.fieldLength * 0.5 + height,
        y: width * 0.5
      }
    ]
  }
}
