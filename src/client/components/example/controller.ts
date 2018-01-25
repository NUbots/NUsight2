import { action } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

import { ExampleModel } from './model'

export class ExampleController {
  private model: ExampleModel

  constructor(opts: { model: ExampleModel }) {
    Object.assign(this, opts)
  }

  static of(opts: { model: ExampleModel }) {
    return new ExampleController(opts)
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
