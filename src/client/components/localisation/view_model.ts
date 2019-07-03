import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { HemisphereLight } from 'three'
import { PointLight } from 'three'
import { Object3D } from 'three'

import { Vector3 } from '../../math/vector3'
import { scene } from '../three/builders'
import { perspectiveCamera } from '../three/builders'
import { Stage } from '../three/three'
import { Canvas } from '../three/three'
import { ConfidenceEllipseViewModel } from './confidence_ellipse/view_model'
import { LocalisationRobotModel } from './darwin_robot/model'

import { FieldViewModel } from './field/view_model'
import { LocalisationModel } from './model'
import { NUgusViewModel } from './nugus_robot/view_model'
import { SkyboxViewModel } from './skybox/view_model'

export class LocalisationViewModel {
  constructor(
    private readonly canvas: Canvas,
    private readonly model: LocalisationModel,
  ) {
  }

  static of(canvas: Canvas, model: LocalisationModel) {
    return new LocalisationViewModel(canvas, model)
  }

  @computed
  get stage(): Stage {
    return { camera: this.camera.get(), scene: this.scene.get() }
  }

  private readonly camera = perspectiveCamera(() => ({
    fov: 75,
    aspect: this.canvas.width / this.canvas.height,
    near: 0.01,
    far: 100,
    position: this.model.camera.position,
    rotation: Vector3.from({
      x: Math.PI / 2 + this.model.camera.pitch,
      y: 0,
      z: -Math.PI / 2 + this.model.camera.yaw,
    }),
    rotationOrder: 'ZXY',
    up: Vector3.from({ x: 0, y: 0, z: 1 }),
  }))

  private readonly scene = scene(() => ({
    children: [
      ...this.robots,
      ...this.fieldConfidenceEllpises,
      this.field,
      this.skybox,
      this.hemisphereLight,
      this.pointLight,
    ],
  }))

  @computed
  private get field() {
    return FieldViewModel.of(this.model.field).field
  }

  @computed
  private get robots(): Object3D[] {
    return this.model.robots
      .filter(robotModel => robotModel.visible)
      .map(robotModel => NUgusViewModel.of(robotModel).robot)
  }

  private get fieldConfidenceEllpises(): Object3D[] {
    return this.model.robots
      .filter(robotModel => robotModel.visible)
      .map(robotModel => this.getRobotConfidenceEllpise(robotModel))
      .filter(exists)
      .map(viewModel => viewModel.confidenceEllipse.get())
  }

  private getRobotConfidenceEllpise = createTransformer((robotModel: LocalisationRobotModel) => {
    return robotModel.confidenceEllipse && ConfidenceEllipseViewModel.of(robotModel.confidenceEllipse, robotModel)
  })

  @computed
  private get hemisphereLight(): HemisphereLight {
    return new HemisphereLight('#fff', '#fff', 0.6)
  }

  @computed
  private get skybox() {
    return SkyboxViewModel.of(this.model.skybox).skybox
  }

  @computed
  private get pointLight() {
    const light = new PointLight('#fff')
    light.position.set(this.model.camera.position.x, this.model.camera.position.y, this.model.camera.position.z)
    return light
  }
}

function exists<T>(t: T | undefined | null): t is T {
  return t != null;
}
