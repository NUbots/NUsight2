import * as THREE from 'three'
import { Vector4 } from '../../../math/vector4'
import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { CameraParams } from '../camera/model'

import { LineProjection } from './line_projection'
import { range } from '../../../../shared/base/range'
import { computed } from 'mobx'

export class DistanceViewModel {
  constructor(
    private readonly params: CameraParams,
    private readonly lineProjection: LineProjection,
  ) {
  }

  static of(canvas: Canvas, params: CameraParams): DistanceViewModel {
    return new DistanceViewModel(params, LineProjection.of(canvas, params.lens))
  }

  readonly distance = group(() => ({
    children: range(25).map((v,i)=>(
        this.lineProjection.cone({
            axis: this.params.Hcw.z.vec3().multiplyScalar(-1),
            radius: Math.cos(Math.atan(((i+1) * 0.2) / this.height)),
            color: new Vector4(1, 1, 1, (i+1) % 5 ? 0.5 : 1),
            lineWidth: (i+1) % 5 ? 2 : 3,
        })))
  }))

  @computed
  private get height() : number {
    const m = new THREE.Matrix4()
    this.params.Hcw.toThree().getInverse(m)
    return m.elements[15]
  }
}
