import { action } from 'mobx'

import { BrowserSystemClock } from '../../../client/time/browser_clock'
import { Clock } from '../../../shared/time/clock'
import { CheckedState } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

import { ChartModel } from './model'
import { TreeViewModel } from './view_model'

export class ChartController {

  private rafId: number

  constructor(private model: ChartModel,
              private clock: Clock) {
    this.model = model
    this.clock = clock
    this.rafId = requestAnimationFrame(this.onAnimationFrame)
  }

  static of(opts: { model: ChartModel }) {
    return new ChartController(opts.model, BrowserSystemClock)
  }

  @action
  onColorChange = (color: string, node: TreeNodeModel): void => {
    if (node instanceof TreeViewModel) {
      node.color = color
    } else {
      throw new Error(`Unsupported node: ${node}`)
    }
  }

  @action
  onNodeExpand = (node: TreeNodeModel): void => {
    node.expanded = !node.expanded
  }

  @action
  onNodeCheck = (node: TreeNodeModel) => {
    if (node.checked === CheckedState.Checked) {
      node.checked = CheckedState.Unchecked
    } else if (node.checked === CheckedState.Unchecked) {
      node.checked = CheckedState.Checked
    } else {
      if (this.model.tree.usePessimisticToggle) {
        node.checked = CheckedState.Unchecked
      } else {
        node.checked = CheckedState.Checked
      }
    }
  }

  @action
  onAnimationFrame = () => {
    this.model.now = this.clock.now() - this.model.startTime
    this.rafId = requestAnimationFrame(this.onAnimationFrame)
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
  }
}
