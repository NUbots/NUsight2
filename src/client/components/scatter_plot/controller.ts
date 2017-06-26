import { action, observable } from 'mobx'
import * as Plotly from 'plotly.js'

export class ScatterplotController {

  public static of(): ScatterplotController {
    return new ScatterplotController()
  }

  @action
  public onScatterplot2d(canvas: HTMLDivElement) {
    const update = {
      type: 'scatterplotgl',
    }
    Plotly.restyle(canvas, update)
  }

  @action
  public onScatterplot3d(canvas: HTMLDivElement) {
    const update = {
      type: 'scatter3d',
    }
    Plotly.restyle(canvas, update)
  }
}
