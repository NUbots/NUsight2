import { computed } from 'mobx'

import { scene } from '../../three/builders'
import { stage } from '../../three/builders'
import { orthographicCamera } from '../../three/builders'
import { Canvas } from '../../three/three'
import { ImageView } from '../image_view/view_model'
import { BallsViewModel } from '../view_model/balls'
import { CompassViewModel } from '../view_model/compass'
import { GoalsViewModel } from '../view_model/goals'
import { GreenHorizonViewModel } from '../view_model/greenhorizon'
import { HorizonViewModel } from '../view_model/horizon'
import { VisualMeshViewModel } from '../view_model/visual_mesh'

import { CameraModel } from './model'

export class CameraViewModel {
  constructor(
    private readonly canvas: Canvas,
    private readonly model: CameraModel,
  ) {
  }

  static of(canvas: Canvas, model: CameraModel) {
    return new CameraViewModel(canvas, model)
  }

  @computed
  get id(): number {
    return this.model.id
  }

  @computed
  get name(): string {
    return this.model.name
  }

  readonly stage = stage(() => ({
    camera: this.camera(),
    scene: this.scene(),
  }))

  readonly camera = orthographicCamera(() => ({ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1 }))

  readonly scene = scene(() => ({
    children: [
      this.image && this.image.image(),
      this.compass && this.compass.compass(),
      this.horizon && this.horizon.horizon(),
      this.greenhorizon && this.greenhorizon.greenhorizon(),
      this.balls && this.balls.balls(),
      this.goals && this.goals.goals(),
      this.visualmesh && this.visualmesh.visualmesh(),
    ],
  }))

  @computed
  private get compass(): CompassViewModel | undefined {
    return this.model.image && CompassViewModel.of(this.canvas, this.model.image)
  }

  @computed
  private get horizon(): HorizonViewModel | undefined {
    return this.model.image && HorizonViewModel.of(this.canvas, this.model.image)
  }

  @computed
  private get visualmesh(): VisualMeshViewModel | undefined {
    return this.model.visualmesh
      && this.model.image
      && VisualMeshViewModel.of(this.canvas, this.model.visualmesh, this.model.image)
  }

  @computed
  private get greenhorizon(): GreenHorizonViewModel | undefined {
    return this.model.greenhorizon
      && this.model.image
      && GreenHorizonViewModel.of(this.canvas, () => this.model.greenhorizon!, this.model.image)
  }

  @computed
  private get balls(): BallsViewModel | undefined {
    return this.model.image
      && BallsViewModel.of(this.model, this.canvas, this.model.image)
  }

  @computed
  private get goals(): GoalsViewModel | undefined {
    return this.model.image
      && GoalsViewModel.of(this.model, this.canvas, this.model.image)
  }

  @computed
  private get image(): ImageView | undefined {
    if (!this.model.image || this.model.image.image.type !== 'element') {
      return
    }

    return ImageView.of({
      type: 'element',
      width: this.model.image.width,
      height: this.model.image.height,
      element: this.model.image.image.element,
      format: this.model.image.image.format,
    })
  }
}
