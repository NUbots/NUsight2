import { autorun } from 'mobx'
import { ColorSpaceVisualizerModel } from './model'
import { ColorSpaceVisualizerViewModel } from './view_model'

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

  private renderScene() {
    this.viewModel.renderer.render(this.viewModel.scene, this.viewModel.camera)
  }
}
