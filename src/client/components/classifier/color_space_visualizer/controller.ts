import { autorun } from 'mobx'
import { ColorSpaceVisualzerModel } from './model'
import { ColorSpaceVisualizerViewModel } from './view_model'

export class ColorSpaceVisualizerController {
  private destroy?: () => void

  constructor(private model: ColorSpaceVisualzerModel) {
  }

  public static of(model: ColorSpaceVisualzerModel) {
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
