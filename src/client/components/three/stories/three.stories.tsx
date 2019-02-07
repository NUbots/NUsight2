import { storiesOf } from '@storybook/react'
import { action } from 'mobx'
import { computed } from 'mobx'
import { reaction } from 'mobx'
import { observable } from 'mobx'
import { disposeOnUnmount } from 'mobx-react'
import { createTransformer } from 'mobx-utils'
import { now } from 'mobx-utils'
import { Component } from 'react'
import * as React from 'react'
import { Color } from 'three'
import { Geometry } from 'three'
import { PointLight } from 'three'
import { BoxGeometry } from 'three'
import { Light } from 'three'

import { disposableComputed } from '../../../base/disposable_computed'
import { Vector2 } from '../../../math/vector2'
import { Vector3 } from '../../../math/vector3'
import { scene } from '../builders'
import { perspectiveCamera } from '../builders'
import { meshPhongMaterial } from '../builders'
import { mesh } from '../builders'
import { Stage } from '../three'
import { Canvas } from '../three'
import { Three } from '../three'

const fullscreen = { width: 'calc(100vw - 20px)', height: 'calc(100vh - 20px)' }
storiesOf('component.three', module)
  .add('renders static scene', () => {
    return <div style={fullscreen}>
      <BoxVisualiser/>
    </div>
  })
  .add('renders animated scene', () => {
    return <div style={fullscreen}>
      <BoxVisualiser animate/>
    </div>
  })

type Model = { boxes: BoxModel[] }
type BoxModel = { color: string, size: number, position: Vector3, rotation: Vector3 }

class BoxVisualiser extends Component<{ animate?: boolean }> {
  @observable
  private readonly model = {
    boxes: [
      { color: 'red', size: 1, position: Vector3.of(), rotation: Vector3.of() },
      { color: 'green', size: 1, position: Vector3.of(), rotation: Vector3.of() },
      { color: 'blue', size: 1, position: Vector3.of(), rotation: Vector3.of() },
    ],
  }

  componentDidMount() {
    this.update(0)
    this.props.animate && disposeOnUnmount(this, reaction(() => now('frame'), this.update))
  }

  render() {
    return <Three stage={this.stage}/>
  }

  private stage = (canvas: Canvas) => {
    const viewModel = new ViewModel(canvas, this.model)
    return computed(() => viewModel.stage)
  }

  @action.bound
  private update(now: number) {
    const t = 2 * Math.PI * now / (20 * 1000)
    const n = this.model.boxes.length
    this.model.boxes.forEach((box, i) => {
      const position = Vector2.fromPolar(1, i * 2 * Math.PI / n + t)
      box.position.set(position.x, position.y, 0)
      box.rotation.set(Math.cos(3 * t + i), Math.cos(5 * t + i), Math.cos(7 * t + i))
    })
  }
}

class ViewModel {
  constructor(private readonly canvas: Canvas, private readonly model: Model) {
  }

  @computed
  get stage(): Stage {
    return { camera: this.camera.get(), scene: this.scene.get() }
  }

  @computed
  private get light(): Light {
    const light = new PointLight()
    light.position.copy(this.camera.get().position)
    return light
  }

  private camera = perspectiveCamera(() => ({
    fov: 60,
    aspect: this.canvas.width / this.canvas.height,
    near: 0.5,
    far: 10,
    position: Vector3.from({ x: 0, y: 0, z: 4 }),
  }))

  private scene = scene(() => ({
    children: [
      ...this.boxes.map(boxViewModel => boxViewModel.box.get()),
      this.light,
    ],
  }))

  @computed
  private get boxes() {
    return this.model.boxes.map(ViewModel.getBox)
  }

  private static getBox = createTransformer((box: BoxModel): BoxViewModel => {
    return BoxViewModel.of(box)
  })
}

class BoxViewModel {
  private static geometry = disposableComputed<Geometry>(() => new BoxGeometry(1, 1, 1))

  constructor(private readonly model: BoxModel) {
  }

  static of(model: BoxModel): BoxViewModel {
    return new BoxViewModel(model)
  }

  readonly box = mesh(() => ({
    geometry: BoxViewModel.geometry.get(),
    material: this.material.get(),
    position: this.model.position,
    rotation: this.model.rotation,
    scale: Vector3.fromScalar(this.model.size),
  }))

  // @disposableComputed
  private material = meshPhongMaterial(() => ({
    color: new Color(this.model.color),
  }))
}
