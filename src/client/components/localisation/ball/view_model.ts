import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { Mesh } from 'three'
import { Object3D } from 'three'
import { SphereGeometry } from 'three'
import { MeshPhongMaterial } from 'three'
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
    const material = new MeshPhongMaterial({
      color: this.model.color,
    })

    const mesh = new Mesh(geometry, material)

    mesh.position.set(
      this.model.position.x,
      this.model.position.y,
      this.model.position.z + (this.model.radius / 2),
    )

    return mesh
  }
}
