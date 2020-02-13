import { IComputedValue } from 'mobx'
import { computed } from 'mobx'
import { computedFn } from 'mobx-utils'
import { createTransformer } from 'mobx-utils'
import * as THREE from 'three'

import { Matrix4 } from '../../../math/matrix4'
import { Vector3 } from '../../../math/vector3'
import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { Cone } from '../camera/model'
import { CameraModel } from '../camera/model'
import { VisionImage } from '../camera/model'
import { Ball } from '../camera/model'

import { WorldLine } from './world_line'

export class BallsViewModel {
  constructor(
    private readonly model: CameraModel,
    private readonly image: VisionImage,
    private readonly worldLine: IComputedValue<WorldLine>,
  ) {
  }

  static of(model: CameraModel, canvas: Canvas, image: VisionImage): BallsViewModel {
    const worldLine = computed(() => WorldLine.of(canvas, image))
    return new BallsViewModel(model, image, worldLine)
  }

  readonly balls = group(() => ({
    children: this.model.balls.map(ball => this.ball(ball)),
  }))

  private ball = computedFn((m: Ball) => {
    const Hwc = new THREE.Matrix4().getInverse(m.Hcw.toThree())
    const Hcc = Matrix4.fromThree(this.image.Hcw.toThree().multiply(Hwc))
    const { axis, radius } = transform(m.cone, m.distance, Hcc)
    return this.worldLine.get().cone({
      axis: axis.toThree(),
      radius: Math.cos(radius),
      colour: m.colour.toThree(),
      lineWidth: 10,
    })
  })
}

export function transform(cone: Cone, distance: number, transform: Matrix4): Cone {
  const oldPoint = cone.axis.toThree().multiplyScalar(distance)
  const newPoint = oldPoint.applyMatrix4(transform.toThree())
  const newDistanceSqr = newPoint.dot(newPoint)
  return {
    axis: Vector3.fromThree(newPoint.normalize()),
    // Source: https://en.wikipedia.org/wiki/Angular_diameter#Formula
    // Takes `radius = cos(asin(radiusActual / distance))` and solves for the new radius given a new distance.
    // Solve sin(acos(r_1)) * d_1 = sin(acos(r_2)) * d_2 for r_2
    // Simplifies to:
    radius: Math.sqrt(distance ** 2 * cone.radius ** 2 - distance ** 2 + newDistanceSqr) / Math.sqrt(newDistanceSqr),
  }
}
