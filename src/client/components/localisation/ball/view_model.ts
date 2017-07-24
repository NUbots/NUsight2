import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { Mesh } from 'three'
import { SphereGeometry } from 'three'
import { MeshLambertMaterial } from 'three'
import { BallModel } from './model'

export class BallViewModel {
  public constructor(private model: BallModel) {
  }

  public static of = createTransformer((model: BallModel): BallViewModel => {
    return new BallViewModel(model)
  })

  @computed
  public get ball(): Mesh {
    const segments = 16
    const rings = 16

    const geometry = new SphereGeometry(this.model.radius, segments, rings)
    const material = new MeshLambertMaterial({
      color: this.model.color,
    })

    return new Mesh(geometry, material)
  }
}
