import { storiesOf } from '@storybook/react'
import { action } from 'mobx'
import { computed } from 'mobx'
import { observable } from 'mobx'
import { reaction } from 'mobx'
import { disposeOnUnmount } from 'mobx-react'
import { now } from 'mobx-utils'
import { Component } from 'react'
import React from 'react'
import * as THREE from 'three'

import { range } from '../../../../../shared/base/range'
import { message } from '../../../../../shared/proto/messages'
import { Matrix4 } from '../../../../math/matrix4'
import { Vector2 } from '../../../../math/vector2'
import { Vector3 } from '../../../../math/vector3'
import { fullscreen } from '../../../storybook/fullscreen'
import { scene } from '../../../three/builders'
import { orthographicCamera } from '../../../three/builders'
import { stage } from '../../../three/builders'
import { Canvas } from '../../../three/three'
import { Three } from '../../../three/three'
import { VisionImage } from '../../camera/model'
import { GreenHorizon } from '../../camera/model'
import { GreenHorizonViewModel } from '../greenhorizon'
import Projection = message.input.Image.Lens.Projection

const camHeight = 0.8

function unprojectRectilinear(point: Vector2, focalLength: number, centre: Vector2): Vector3 {
  const offset = point.add(centre)
  return new Vector3(focalLength, offset.x, offset.y).normalize()
}

function lissajous(t: number, a = 3, b = 4) {
  // https://en.wikipedia.org/wiki/Lissajous_curve
  return new Vector2(Math.sin(a * t), Math.sin(b * t))
}

storiesOf('components.vision2.greenhorizon', module)
  .addDecorator(fullscreen)
  .add('Renders statically', () => <GreenHorizonHarness/>)
  .add('Renders animated', () => <GreenHorizonHarness animate/>)

const Hwc = Matrix4.fromThree(
  new THREE.Matrix4().makeTranslation(0, 0, camHeight)
    .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 4)),
)
const Hcw = Matrix4.fromThree(new THREE.Matrix4().getInverse(Hwc.toThree()))

class GreenHorizonHarness extends Component<{ animate?: boolean }> {
  render() {
    return <Three stage={this.stage}/>
  }

  private readonly stage = (canvas: Canvas) => {
    const viewModel = this.createModel(canvas)
    return computed(() => [
      viewModel.stage,
    ], { equals: () => false })
  }

  private createModel(canvas: Canvas): ViewModel {
    const model = observable({
      greenhorizon: {
        horizon: [] as Vector3[],
        Hcw,
      },
    })
    const focalLength = 415 / 800
    const centre = Vector2.of()
    const image: VisionImage = {
      Hcw,
      lens: {
        projection: Projection.RECTILINEAR,
        focalLength,
        centre,
      },
      width: 800,
      height: 600,
      image: { type: 'element', element: new Image(), format: 0 },
    }
    this.update(model, 0)
    this.props.animate && disposeOnUnmount(this, reaction(
      () => now('frame') / 1000,
      t => this.update(model, t),
      { fireImmediately: true },
    ))
    return ViewModel.of(canvas, () => model.greenhorizon, image)
  }

  @action.bound
  private update(model: { greenhorizon: GreenHorizon }, time: number) {
    const focalLength = 415 / 800
    const centre = Vector2.of()
    const n = 50
    model.greenhorizon = {
      horizon: range(n + 1)
        .map(i => {
          const t = mod2pi(2 * Math.PI * (i / n) + time / 10)
          const p = lissajous(t).multiplyScalar(0.2)
          const rFCc = unprojectRectilinear(p, focalLength, centre)
          const Rwc = new THREE.Matrix4().extractRotation(Hwc.toThree())
          return Vector3.fromThree(rFCc.toThree().applyMatrix4(Rwc)) // rFCw
        }),
      Hcw,
    }
  }
}

const mod = (n: number) => (x: number): number => (x % n + n) % n
const mod2pi = mod(2 * Math.PI)

class ViewModel {
  constructor(private readonly viewModel: GreenHorizonViewModel) {
  }

  static of(canvas: Canvas, model: () => GreenHorizon, image: VisionImage) {
    const viewModel = GreenHorizonViewModel.of(canvas, model, image)
    return new ViewModel(viewModel)
  }

  readonly stage = stage(() => ({ camera: this.camera(), scene: this.scene() }))

  private readonly camera = orthographicCamera(() => ({ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1 }))

  private readonly scene = scene(() => ({ children: [this.viewModel.greenhorizon()] }))
}
