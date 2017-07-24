import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { Mesh } from 'three'
import { Object3D } from 'three'
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
  public get mesh(): Mesh {
    const segments = 16
    const rings = 16

    const geometry = new SphereGeometry(this.model.radius, segments, rings)
    const material = new MeshLambertMaterial({
      color: this.model.color,
    })

    return new Mesh(geometry, material)
  }

  @computed
  public get ball(): Object3D {
    const ball = new Object3D()

    ball.position.x = this.model.position.x
    ball.position.y = this.model.position.y
    ball.position.z = this.model.position.z

    ball.add(this.mesh)

    return ball
  }
}
