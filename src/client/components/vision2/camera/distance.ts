import { computed } from 'mobx'
import * as THREE from 'three'

import { range } from '../../../../shared/base/range'
import { Vector4 } from '../../../math/vector4'
import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { CameraParams } from '../camera/model'

import { LineProjection } from './line_projection'

export class DistanceViewModel {
  constructor(
    private readonly params: CameraParams,
    private readonly lineProjection: LineProjection,
    private readonly majorStepDistance: number,
    private readonly minorLines: number,
    private readonly maxDistance: number,
  ) {
  }

  static of(canvas: Canvas, params: CameraParams): DistanceViewModel {
    return new DistanceViewModel(params, LineProjection.of(canvas, params.lens), 1.0, 3, 5)
  }

  readonly distance = group(() => ({
    children: range((this.minorLines + 1) * this.maxDistance / this.majorStepDistance).map(i => (
        this.lineProjection.cone({
          axis: this.params.Hcw.z.vec3().multiplyScalar(-1),
          radius: Math.cos(Math.atan(((i + 1) / (this.minorLines + 1)) / this.height)),
          color: new Vector4(1, 1, 1, (i + 1) % (this.minorLines + 1) ? 0.2 : 0.4),
          lineWidth: (i + 1) % (this.minorLines + 1) ? 2 : 3,
        }))),
  }))

  @computed
  private get height() : number {
    return new THREE.Matrix4().getInverse(this.params.Hcw.toThree()).elements[15]
  }
}
