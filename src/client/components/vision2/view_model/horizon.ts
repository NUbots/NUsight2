import * as THREE from 'three'

import { group } from '../../three/builders'
import { Canvas } from '../../three/three'
import { VisionImage } from '../camera/model'

import { WorldLine } from './world_line'

export class HorizonViewModel {
  constructor(
    private readonly image: VisionImage,
    private readonly worldLine: WorldLine,
  ) {
  }

  static of(canvas: Canvas, image: VisionImage): HorizonViewModel {
    return new HorizonViewModel(image, WorldLine.of(canvas, image))
  }

  readonly horizon = group(() => ({
    children: [
      this.worldLine.makePlane({
        axis: this.image.Hcw.z.vec3().toThree(),
        colour: new THREE.Vector4(0, 0, 1, 0.7),
        lineWidth: 10,
      }),
    ],
  }))
}
