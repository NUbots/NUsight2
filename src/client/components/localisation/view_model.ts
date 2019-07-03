import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import * as THREE from 'three'
import { Color } from 'three'
import { SphereGeometry } from 'three'
import { HemisphereLight } from 'three'
import { PointLight } from 'three'
import { Object3D } from 'three'
import { disposableComputed } from '../../base/disposable_computed'
import { Matrix4 } from '../../math/matrix4'
import { Vector2 } from '../../math/vector2'

import { Vector3 } from '../../math/vector3'
import { Vector4 } from '../../math/vector4'
import { group } from '../three/builders'
import { meshPhongMaterial } from '../three/builders'
import { mesh } from '../three/builders'
import { scene } from '../three/builders'
import { perspectiveCamera } from '../three/builders'
import { Stage } from '../three/three'
import { Canvas } from '../three/three'
import { ConfidenceEllipseViewModel } from './confidence_ellipse/view_model'
import { LocalisationRobotBall } from './darwin_robot/model'
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
      ...this.robotBalls,
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

  @computed
  private get robotBalls(): Object3D[] {
    return this.model.robots
      .filter(robotModel => robotModel.visible)
      .map(robotModel => this.getRobotBall(robotModel))
      .filter(exists)
      .map(viewModel => viewModel.ball.get())

  }

  private getRobotConfidenceEllpise = createTransformer((robotModel: LocalisationRobotModel) => {
    return robotModel.confidenceEllipse && ConfidenceEllipseViewModel.of(robotModel.confidenceEllipse, robotModel)
  })

  private getRobotBall = createTransformer((robotModel: LocalisationRobotModel) => {
    return robotModel.ball && BallViewModel.of(robotModel, robotModel.ball)
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

class BallViewModel {
  constructor(
    private readonly robotModel: LocalisationRobotModel,
    private readonly ballModel: LocalisationRobotBall,
  ) {
  }

  static of(robotModel: LocalisationRobotModel, ballModel: LocalisationRobotBall) {
    return new BallViewModel(robotModel, ballModel)
  }

  readonly ball = group(() => ({
    children: [
      this.sphere.get(),
      this.confidenceEllipse.confidenceEllipse.get(),
    ],
  }))

  @computed
  private get confidenceEllipse() {
    return ConfidenceEllipseViewModel.of(this.ballModel.confidenceEllipse, this.robotModel)
  }

  readonly sphere = mesh(() => ({
    geometry: this.geometry.get(),
    material: this.material.get(),
    position: this.ballPosition(),
  }))

  private ballPosition(): Vector3 {
    return fromThreeVector3(new THREE.Vector3(this.ballModel.position.x, this.ballModel.position.y, 0.095)
      .applyMatrix4(toThreeMatrix4(this.robotModel.Hfw)))
  }

  private geometry = disposableComputed(() => new SphereGeometry(0.095, 30, 30))

  private material = meshPhongMaterial(() => ({
    color: new Color('orange'),
  }))
}

function exists<T>(t: T | undefined | null): t is T {
  return t != null
}

function toThreeMatrix4(mat4: Matrix4): THREE.Matrix4 {
  return new THREE.Matrix4().set(
    mat4.x.x, mat4.y.x, mat4.z.x, mat4.t.x,
    mat4.x.y, mat4.y.y, mat4.z.y, mat4.t.y,
    mat4.x.z, mat4.y.z, mat4.z.z, mat4.t.z,
    mat4.x.t, mat4.y.t, mat4.z.t, mat4.t.t,
  )
}

function fromThreeMatrix4(mat4: THREE.Matrix4): Matrix4 {
  return new Matrix4(
    new Vector4(mat4.elements[0], mat4.elements[1], mat4.elements[2], mat4.elements[3]),
    new Vector4(mat4.elements[4], mat4.elements[5], mat4.elements[6], mat4.elements[7]),
    new Vector4(mat4.elements[8], mat4.elements[9], mat4.elements[10], mat4.elements[11]),
    new Vector4(mat4.elements[12], mat4.elements[13], mat4.elements[14], mat4.elements[15]),
  )
}

function toThreeVector2(vec2: Vector2): THREE.Vector2 {
  return new THREE.Vector2(vec2.x, vec2.y)
}

function fromThreeVector2(vec2: THREE.Vector2): Vector2 {
  return new Vector2(vec2.x, vec2.y)
}

function toThreeVector3(vec3: Vector3): THREE.Vector3 {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z)
}

function fromThreeVector3(vec3: THREE.Vector3): Vector3 {
  return new Vector3(vec3.x, vec3.y, vec3.z)
}
