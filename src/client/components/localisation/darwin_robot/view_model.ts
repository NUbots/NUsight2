import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Color } from 'three'
import { CircleGeometry } from 'three'
import { Object3D } from 'three'
import { Quaternion } from 'three'

import { disposableComputed } from '../../../base/disposable_computed'
import { Vector3 } from '../../../math/vector3'
import { meshBasicMaterial } from '../../three/builders'
import { mesh } from '../../three/builders'

import { BodyViewModel } from './body/view_model'
import { LocalisationRobotModel } from './model'

export const HIP_TO_FOOT = 0.2465

export class RobotViewModel {
  constructor(private model: LocalisationRobotModel) {
  }

  static of = createTransformer((model: LocalisationRobotModel): RobotViewModel => {
    return new RobotViewModel(model)
  })

  @computed
  get robot(): Object3D {
    const robot = new Object3D()
    robot.position.x = this.model.rTWw.x
    robot.position.y = this.model.rTWw.y
    robot.position.z = this.model.rTWw.z
    const rotation = new Quaternion(this.model.Rwt.x, this.model.Rwt.y, this.model.Rwt.z, this.model.Rwt.w)
    robot.setRotationFromQuaternion(rotation)
    robot.add(BodyViewModel.of(this.model).body)
    robot.add(this.confidenceEllipse.get())
    return robot
  }

  readonly confidenceEllipse = mesh(() => ({
    geometry: this.ellipseGeometry.get(),
    material: this.ellipseMaterial.get(),
    scale: new Vector3(
      this.model.confidenceEllipse!.scaleX,
      this.model.confidenceEllipse!.scaleY,
      1,
    ),
    rotation: new Vector3(0, 0, this.model.confidenceEllipse!.rotation),
  }))

  readonly ellipseMaterial = meshBasicMaterial(() => ({
    color: new Color('purple'),
  }))

  readonly ellipseGeometry = disposableComputed(() => new CircleGeometry(1, 50))
}
