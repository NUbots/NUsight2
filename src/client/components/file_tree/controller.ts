import { action } from 'mobx'

import { FileTreeModel, TreeNode } from './model'

export class FileTreeController {
  constructor(private model: FileTreeModel) {}

  static of(model: FileTreeModel) {
    return new FileTreeController(model)
  }

  @action
  toggleNode(node: TreeNode) {
    node.expanded = !node.expanded
  }

  @action
  selectNode(node: TreeNode) {
    this.model.selectedNode = node
  }
}
