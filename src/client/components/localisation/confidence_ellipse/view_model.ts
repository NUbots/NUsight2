import { Color } from 'three'
import { CircleGeometry } from 'three'
import { disposableComputed } from '../../../base/disposable_computed'
import { Vector3 } from '../../../math/vector3'
import { meshBasicMaterial } from '../../three/builders'
import { mesh } from '../../three/builders'
import { ConfidenceEllipse } from '../darwin_robot/model'

export class ConfidenceEllipseViewModel {
  constructor(private readonly model: ConfidenceEllipse) {
  }

  static of(model: ConfidenceEllipse) {
    return new ConfidenceEllipseViewModel(model)
  }

  readonly confidenceEllipse = mesh(() => ({
    geometry: this.ellipseGeometry.get(),
    material: this.ellipseMaterial.get(),
    scale: new Vector3(
      this.model.scaleX,
      this.model.scaleY,
      1,
    ),
    rotation: new Vector3(0, 0, this.model.rotation),
  }))

  readonly ellipseMaterial = meshBasicMaterial(() => ({
    color: new Color('purple'),
  }))

  readonly ellipseGeometry = disposableComputed(() => new CircleGeometry(1, 50))
}
