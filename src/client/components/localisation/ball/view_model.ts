import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { CircleGeometry } from 'three'
import { Mesh } from 'three'
import { MeshBasicMaterial } from 'three'
import { MeshPhongMaterial } from 'three'
import { SphereGeometry } from 'three'
import { Vector3 } from 'three'
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

    mesh.add(this.confidenceEllipse)

    return mesh
  }

  @computed
  public get confidenceEllipse(): Mesh {
    const ellipse = new CircleGeometry(1, 32)
    const material = new MeshBasicMaterial({
      transparent: true,
      color: this.model.confidenceEllipse.color,
      opacity: this.model.confidenceEllipse.opacity,
    })

    const mesh = new Mesh(ellipse, material)

    const { x, y, z } = this.model.confidenceEllipse.position
    const rotationAxis = this.model.confidenceEllipse.rotationAxis

    mesh.position.set(x, y, z)
    mesh.scale.setX(this.model.confidenceEllipse.scaleX)
    mesh.scale.setY(this.model.confidenceEllipse.scaleY)

    mesh.quaternion.setFromAxisAngle(
      new Vector3(rotationAxis.x, rotationAxis.y, rotationAxis.z),
      this.model.confidenceEllipse.rotationAngle,
    )

    return mesh
  }
}
