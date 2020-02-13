import { IComputedValue } from 'mobx'
import { computed } from 'mobx'
import * as THREE from 'three'

import { range } from '../../../../shared/base/range'
import { Matrix4 } from '../../../math/matrix4'
import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { GreenHorizon } from '../../vision/camera/model'
import { VisionImage } from '../camera/model'

import { WorldLine } from './world_line'
import { coneSegment } from './world_line'

export class GreenHorizonViewModel {
  constructor(
    private readonly canvas: Canvas,
    private readonly model: () => GreenHorizon,
    private readonly image: VisionImage,
    private readonly worldLine: IComputedValue<WorldLine>,
  ) {
  }

  static of(canvas: Canvas, model: () => GreenHorizon, image: VisionImage): GreenHorizonViewModel {
    const worldLine = computed(() => WorldLine.of(canvas, image))
    return new GreenHorizonViewModel(canvas, model, image, worldLine)
  }

  readonly greenhorizon = group(() => ({
    children: range(this.model().horizon.length - 1).map(index => {
      return this.worldLine.get().planeSegment(this.segment(index))
    }),
  }))

  private readonly segment = coneSegment((index: number) => ({
    start: this.rays[index],
    end: this.rays[index + 1],
    colour: new THREE.Vector4(0, 0.8, 0, 0.8),
    lineWidth: 10,
  }))

  @computed
  private get rays() {
    const Hcw = this.model().Hcw
    const Hwc = Matrix4.fromThree(new THREE.Matrix4().getInverse(Hcw.toThree()))
    return this.model().horizon.map(v => v.toThree() // rUCw
      // Project world space vector to ground
      .multiplyScalar(v.z !== 0 ? -Hwc.t.z / v.z : 1) // rFCw
      .add(Hwc.t.vec3().toThree()) // rFWw = rFCw + rCWw
      .applyMatrix4(this.image.Hcw.toThree()) // rFCc
      .normalize(), // rUCc
    )
  }
}

