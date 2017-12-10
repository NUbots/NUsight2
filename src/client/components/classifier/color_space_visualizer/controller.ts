import { action } from 'mobx'
import { autorun } from 'mobx'
import { Vector2 } from '../../../math/vector2'
import { ColorSpaceVisualizerModel } from './model'
import { ColorSpaceVisualizerViewModel } from './view_model'

const PI2 = Math.PI / 2
const DegToRad = Math.PI / 180

export class ColorSpaceVisualizerController {
  private viewModel = ColorSpaceVisualizerViewModel.of(this.model)
  private destroy?: () => void

  constructor(private model: ColorSpaceVisualizerModel) {
  }

  public static of(model: ColorSpaceVisualizerModel) {
    return new ColorSpaceVisualizerController(model)
  }

  public componentDidMount = () => {
    this.destroy = autorun(() => this.renderScene())
  }

  public componentWillUnmount = () => {
    this.destroy && this.destroy()
  }

  @action
  public onMouseDown = (x: number, y: number) => {
    this.viewModel.mouseDown = true
    this.viewModel.startDrag = Vector2.of(x, y)
  }

  @action
  public onMouseMove = (x: number, y: number) => {
    if (!this.viewModel.mouseDown) {
      return
    }
    const newDrag = Vector2.of(x, y)
    const diff = newDrag.subtract(this.viewModel.startDrag).multiplyScalar(DegToRad)
    this.model.camera.azimuth -= diff.x
    this.model.camera.elevation = clamp(this.model.camera.elevation - diff.y, -PI2 + 0.01, PI2 - 0.01)
    this.viewModel.startDrag = Vector2.of(x, y)
  }

  @action
  public onMouseUp = () => {
    this.viewModel.mouseDown = false
  }

  @action
  public onWheel = (deltaY: number, preventDefault: () => void) => {
    this.model.camera.distance = clamp(this.model.camera.distance + deltaY / 100, 0.01, 10)
    preventDefault()
  }

  private renderScene() {
    this.viewModel.renderer.render(this.viewModel.scene, this.viewModel.camera)
  }
}

function clamp(x: number, min: number = -Infinity, max: number = Infinity) {
  return Math.min(max, Math.max(min, x))
}
