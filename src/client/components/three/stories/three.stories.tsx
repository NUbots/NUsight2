import { storiesOf } from '@storybook/react'
import { observable } from 'mobx'
import { action } from 'mobx'
import { computed } from 'mobx'
import { reaction } from 'mobx'
import { disposeOnUnmount } from 'mobx-react'
import { createTransformer } from 'mobx-utils'
import { now } from 'mobx-utils'
import { Component } from 'react'
import * as React from 'react'
import { Object3D } from 'three'
import { Scene } from 'three'
import { Camera } from 'three'
import { PointLight } from 'three'
import { MeshPhongMaterial } from 'three'
import { Mesh } from 'three'
import { BoxGeometry } from 'three'
import { PerspectiveCamera } from 'three'
import { Light } from 'three'

import { Vector2 } from '../../../math/vector2'
import { Vector3 } from '../../../math/vector3'
import { Stage } from '../three'
import { Canvas } from '../three'
import { Three } from '../three'

type Model = { boxes: BoxModel[] }
type BoxModel = { color: string, size: number, position: Vector3, rotation: Vector3 }

class BoxVisualiser extends Component<{ animate?: boolean }> {
  @observable
  private model = {
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

  @action.bound
  update(now: number) {
    const t = 2 * Math.PI * now / (20 * 1000)
    const n = this.model.boxes.length
    this.model.boxes.forEach((box, i) => {
      const position = Vector2.fromPolar(1, i * 2 * Math.PI / n + t)
      box.position.set(position.x, position.y, 0)
      box.rotation.set(Math.cos(3 * t + i), Math.cos(5 * t + i), Math.cos(7 * t + i))
    })
  }

  render() {
    return <Three createStage={this.createStage}/>
  }

  private createStage = (canvas: Canvas) => {
    const viewModel = new ViewModel(canvas, this.model)
    return computed(() => viewModel.stage)
  }
}


class ViewModel {
  constructor(private readonly canvas: Canvas, private readonly model: Model) {
  }

  @computed
  get stage(): Stage {
    return { camera: this.camera, scene: this.scene }
  }

  @computed
  private get light(): Light {
    const light = new PointLight()
    light.position.copy(this.camera.position)
    return light
  }

  @computed
  private get aspect() {
    return this.canvas.width / this.canvas.height
  }

  @computed
  private get camera(): Camera {
    const camera = new PerspectiveCamera(60, this.aspect, 0.5, 10)
    camera.position.z = 4
    return camera
  }

  @computed
  private get scene(): Scene {
    const scene = new Scene()
    scene.add(...this.model.boxes.map(this.getBox))
    scene.add(this.light)
    return scene
  }

  private getBox = createTransformer((box: BoxModel): Object3D => {
    return BoxViewModel.of(box).box
  })
}

class BoxViewModel {
  private static geometry = computed(() => new BoxGeometry(1, 1, 1))

  constructor(private readonly model: BoxModel) {
  }

  static of(model: BoxModel): BoxViewModel {
    return new BoxViewModel(model)
  }

  @computed
  get box(): Mesh {
    const mesh = new Mesh(BoxViewModel.geometry.get(), this.material)
    mesh.position.set(this.model.position.x, this.model.position.y, this.model.position.z)
    mesh.rotation.set(this.model.rotation.x, this.model.rotation.y, this.model.rotation.z)
    mesh.scale.setScalar(this.model.size)
    return mesh
  }

  @computed
  private get material() {
    return new MeshPhongMaterial({ color: this.model.color })
  }
}

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
