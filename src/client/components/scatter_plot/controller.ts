import { action, observable } from 'mobx'
import { ScatterplotModel } from './model'

export class ScatterplotController {

  public static of(): ScatterplotController {
    return new ScatterplotController()
  }

  @action
  public onScatterplot2d(model: ScatterplotModel) {
    model.graphType = 'scatterplotgl'
  }

  @action
  public onScatterplot3d(model: ScatterplotModel) {
    model.graphType = 'scatter3d'
  }
}
