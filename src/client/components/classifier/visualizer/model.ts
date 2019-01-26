import { observable } from 'mobx'

import { Vector2 } from '../../../math/vector2'
import { Lut } from '../lut'

export class VisualizerModel {
  @observable.ref width: number
  @observable.ref height: number
  @observable.shallow camera: { distance: number, elevation: number, azimuth: number }
  @observable.ref mouseDown: boolean
  @observable.ref startDrag: Vector2

  constructor(readonly lut: Lut, { width, height, camera, mouseDown, startDrag }: {
    width: number,
    height: number
    camera: { distance: number, elevation: number, azimuth: number }
    mouseDown: boolean,
    startDrag: Vector2
  }) {
    this.width = width
    this.height = height
    this.camera = camera
    this.mouseDown = mouseDown
    this.startDrag = startDrag
  }

  static of(lut: Lut): VisualizerModel {
    return new VisualizerModel(lut, {
      width: 512,
      height: 512,
      camera: {
        distance: 3,
        elevation: 0,
        azimuth: 0,
      },
      mouseDown: false,
      startDrag: Vector2.of(),
    })
  }
}
