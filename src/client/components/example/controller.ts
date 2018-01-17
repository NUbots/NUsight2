import { action } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { createNodesFromData } from '../checkbox_tree/model'
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
    if (node.leaf) {
      if (node.checkedState === CheckedState.Checked) {
        this.uncheckNode(node)
      } else {
        this.checkNode(node)
      }
    } else if (node.children.every(node => node.checkedState === CheckedState.Checked)) {
      this.uncheckNode(node)
    } else if (node.children.every(node => node.checkedState === CheckedState.Unchecked)) {
      this.checkNode(node)
    } else {
      if (this.model.treeModel.usePessimisticToggle) {
        this.uncheckNode(node)
      } else {
        this.checkNode(node)
      }
    }
  }

  @action
  checkNode = (node: TreeNodeModel) => {
    node.checkedState = CheckedState.Checked
    node.children.forEach(this.checkNode)
  }

  @action
  uncheckNode = (node: TreeNodeModel) => {
    node.checkedState = CheckedState.Unchecked
    node.children.forEach(this.uncheckNode)
  }
}
