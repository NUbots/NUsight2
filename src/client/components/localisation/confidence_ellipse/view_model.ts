import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { CircleGeometry } from 'three'
import { Mesh } from 'three'
import { MeshBasicMaterial } from 'three'
import { Vector3 } from 'three'
import { ConfidenceEllipseModel } from './model'

export class ConfidenceEllipseViewModel {
  public constructor(private model: ConfidenceEllipseModel) {
  }

  public static of = createTransformer((model: ConfidenceEllipseModel): ConfidenceEllipseViewModel => {
    return new ConfidenceEllipseViewModel(model)
  })

  @computed
  public get ellipse(): Mesh {
    const ellipse = new CircleGeometry(1, 32)
    const material = new MeshBasicMaterial({
      transparent: true,
      color: this.model.color,
      opacity: this.model.opacity,
    })

    const mesh = new Mesh(ellipse, material)

    const { x, y, z } = this.model.position
    const rotationAxis = this.model.rotationAxis

    mesh.position.set(x, y, z)
    mesh.scale.setX(this.model.scaleX)
    mesh.scale.setY(this.model.scaleY)

    mesh.quaternion.setFromAxisAngle(
      new Vector3(rotationAxis.x, rotationAxis.y, rotationAxis.z),
      this.model.rotationAngle,
    )

    return mesh
  }
}
