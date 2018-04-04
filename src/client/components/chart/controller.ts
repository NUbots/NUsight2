import { action } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

import { ChartModel } from './model'

export class ChartController {
  private model: ChartModel

  constructor(opts: { model: ChartModel }) {
    this.model = opts.model
  }

  static of(opts: { model: ChartModel }) {
    return new ChartController(opts)
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
}
