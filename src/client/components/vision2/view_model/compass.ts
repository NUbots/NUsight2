import { computed } from 'mobx'

import { Vector4 } from '../../../math/vector4'
import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { VisionImage } from '../camera/model'

import { WorldLine } from './world_line'

export class CompassViewModel {
  constructor(
    private readonly image: VisionImage,
    private readonly makeWorldLine: () => WorldLine,
  ) {
  }

  static of(canvas: Canvas, image: VisionImage): CompassViewModel {
    const makeWorldLine = () => WorldLine.of(canvas, image)
    return new CompassViewModel(image, makeWorldLine)
  }

  readonly compass = group(() => ({
    children: [
      this.xPositiveAxis,
      this.xNegativeAxis,
      this.yPositiveAxis,
      this.yNegativeAxis,
    ],
  }))

  private get Hcw() {
    return this.image.Hcw
  }

  @computed
  private get xPositiveAxis() {
    return this.xPositiveLine.planeSegment({
      start: this.Hcw.x.vec3().toThree(),
      end: this.Hcw.z.vec3().multiplyScalar(-1).toThree(),
      colour: new Vector4(1, 0, 0, 0.5).toThree(), // Red
      lineWidth: 5,
    })
  }

  @computed
  private get xNegativeAxis() {
    return this.xNegativeLine.planeSegment({
      start: this.Hcw.x.vec3().multiplyScalar(-1).toThree(),
      end: this.Hcw.z.vec3().multiplyScalar(-1).toThree(),
      colour: new Vector4(0, 1, 1, 0.5).toThree(), // Cyan
      lineWidth: 5,
    })
  }

  @computed
  private get yPositiveAxis() {
    return this.yPositiveLine.planeSegment({
      start: this.Hcw.y.vec3().toThree(),
      end: this.Hcw.z.vec3().multiplyScalar(-1).toThree(),
      colour: new Vector4(0, 1, 0, 0.5).toThree(), // Green
      lineWidth: 5,
    })
  }


  @computed
  private get yNegativeAxis() {
    return this.yNegativeLine.planeSegment({
      start: this.Hcw.y.vec3().multiplyScalar(-1).toThree(),
      end: this.Hcw.z.vec3().multiplyScalar(-1).toThree(),
      colour: new Vector4(1, 0, 1, 0.5).toThree(), // Magenta
      lineWidth: 5,
    })
  }

  private readonly xPositiveLine = this.makeWorldLine()
  private readonly xNegativeLine = this.makeWorldLine()
  private readonly yPositiveLine = this.makeWorldLine()
  private readonly yNegativeLine = this.makeWorldLine()

}
