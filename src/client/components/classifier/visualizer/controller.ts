import { action } from 'mobx'
import { autorun } from 'mobx'

import { Vector2 } from '../../../math/vector2'

import { VisualizerModel } from './model'
import { VisualizerViewModel } from './view_model'

const PI2 = Math.PI / 2
const DegToRad = Math.PI / 180

export class VisualizerController {
  constructor(private model: VisualizerModel) {
  }

  static of(model: VisualizerModel) {
    return new VisualizerController(model)
  }

  @action
  onMouseDown = (x: number, y: number) => {
    this.model.mouseDown = true
    this.model.startDrag = Vector2.of(x, y)
  }

  @action
  onMouseMove = (x: number, y: number) => {
    if (!this.model.mouseDown) {
      return
    }
    const newDrag = Vector2.of(x, y)
    const diff = newDrag.subtract(this.model.startDrag).multiplyScalar(0.5 * DegToRad)
    this.model.camera.azimuth -= diff.x
    this.model.camera.elevation = clamp(this.model.camera.elevation - diff.y, -PI2 + 0.01, PI2 - 0.01)
    this.model.startDrag = Vector2.of(x, y)
  }

  @action
  onMouseUp = () => {
    this.model.mouseDown = false
  }

  @action
  onWheel = (deltaY: number, preventDefault: () => void) => {
    this.model.camera.distance = clamp(this.model.camera.distance + deltaY / 500, 0.01, 10)
    preventDefault()
  }
}

function clamp(x: number, min: number = -Infinity, max: number = Infinity) {
  return Math.min(max, Math.max(min, x))
}
