import { computed } from 'mobx'
import { IComputedValue } from 'mobx'
import { computedFn } from 'mobx-utils'
import * as THREE from 'three'

import { FieldDimensions } from '../../../../shared/field/dimensions'
import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { CameraModel } from '../camera/model'
import { VisionImage } from '../camera/model'
import { Goal } from '../camera/model'

import { WorldLine } from './world_line'

export class GoalsViewModel {
  constructor(
    private readonly model: CameraModel,
    private readonly image: VisionImage,
    private readonly worldLine: IComputedValue<WorldLine>,
  ) {
  }

  static of(model: CameraModel, canvas: Canvas, image: VisionImage): GoalsViewModel {
    const worldLine = computed(() => WorldLine.of(canvas, image))
    return new GoalsViewModel(model, image, worldLine)
  }

  readonly goals = group(() => ({
    children: this.model.goals.map(goal => this.goal(goal)),
  }))

  private goal = computedFn((goal: Goal) => {
    const Hwc = new THREE.Matrix4().getInverse(goal.Hcw.toThree())
    const Hcc = this.image.Hcw.toThree().multiply(Hwc)
    const oldBottom = goal.post.bottom.toThree().multiplyScalar(goal.post.distance)
    const newBottom = oldBottom.clone().applyMatrix4(Hcc)
    const newTop = oldBottom.clone()
      .applyMatrix4(Hwc)
      .add(new THREE.Vector3(0, 0, FieldDimensions.postYear2017().goalCrossbarHeight))
      .applyMatrix4(this.image.Hcw.toThree())
    return this.worldLine.get().planeSegment({
      start: newTop.normalize(),
      end: newBottom.normalize(),
      colour: getColor(),
      lineWidth: 10,
    })

    function getColor() {
      const color = '#ffff00'
      switch (goal.side) {
        case 'left':
          return new THREE.Vector4(1.0, 1.0, 0, 1.0) // Yellow
        case 'right':
          return new THREE.Vector4(0.0, 1.0, 1.0, 1.0) // Cyan
        case 'unknown':
          return new THREE.Vector4(1.0, 0.0, 1.0, 1.0) // Magenta
        default:
          throw new Error()
      }
    }
  })
}
