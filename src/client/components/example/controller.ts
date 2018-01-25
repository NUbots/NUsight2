import { action } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

import { ExampleModel } from './model'
import { ExampleTreeViewModel } from './view_model'

export class ExampleController {
  private model: ExampleModel

  constructor(opts: { model: ExampleModel }) {
    Object.assign(this, opts)
  }

  static of(opts: { model: ExampleModel }) {
    return new ExampleController(opts)
  }

  @action
  onColorChange = (color: string, node: TreeNodeModel): void => {
    if (node instanceof ExampleTreeViewModel) {
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
}
