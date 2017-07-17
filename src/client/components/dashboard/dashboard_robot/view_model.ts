import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { Vector2 } from '../../../math/vector2'
import { CircleProps } from '../canvas_renderer/renderer'
import { LineProps } from '../canvas_renderer/renderer'
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
  private get ball(): CircleProps {
    return {
      fillStyle: this.model.ballColor,
      radius: 0.1,
      type: 'circle',
      x: this.model.ballWorldPosition.x,
      y: this.model.ballWorldPosition.y
    }
  }

  @computed
  private get robotMarker() {
    return [
    ]
  }
}
