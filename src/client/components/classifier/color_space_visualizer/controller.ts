import { autorun } from 'mobx'
import { ColorSpaceVisualizerModel } from './model'
import { ColorSpaceVisualizerViewModel } from './view_model'

export class ColorSpaceVisualizerController {
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
    const viewModel = ColorSpaceVisualizerViewModel.of(this.model)
    viewModel.renderer.render(viewModel.scene, viewModel.camera)
  }
}
