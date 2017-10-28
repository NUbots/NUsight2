import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { memoize } from '../../../base/memoize'
import { BasicAppearance } from '../../../canvas/appearance/basic_appearance'
import { CircleGeometry } from '../../../canvas/geometry/circle_geometry'
import { PolygonGeometry } from '../../../canvas/geometry/polygon_geometry'
import { Group } from '../../../canvas/object/group'
import { Shape } from '../../../canvas/object/shape'
import { CanvasRenderer } from '../../../canvas/renderer'
import { Transform } from '../../../math/transform'
import { VisionRobotModel } from '../model'

export class VisionObjectsViewModel {
  public renderer = memoize((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    return CanvasRenderer.of(ctx!)
  })

  public constructor(private robotModel: VisionRobotModel) {
  }

  public static of = createTransformer((robotModel: VisionRobotModel) => {
    return new VisionObjectsViewModel(robotModel)
  })

  @computed
  public get camera(): Transform {
    return Transform.of({ anticlockwise: false })
  }

  @computed
  public get scene(): Group {
    return Group.of({
      children: [
        this.balls,
        this.goals,
      ],
    })
  }

  @computed
  private get balls(): Group {
    return Group.of({
      children: this.robotModel.balls.map(ball => Shape.of(
        CircleGeometry.of({
          radius: ball.radius,
          x: ball.centre.x,
          y: ball.centre.y,
        }),
        BasicAppearance.of({
          fillStyle: 'orange',
        }),
      )),
    })
  }

  @computed
  private get goals(): Group {
    return Group.of({
      children: this.robotModel.goals.map(goal => Shape.of(
        PolygonGeometry.of([
          goal.tl,
          goal.tr,
          goal.br,
          goal.bl,
        ]),
        BasicAppearance.of({
          fillStyle: 'yellow',
        }),
      )),
    })
  }
}
