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

  sortNodes(a: TreeNode, b: TreeNode) {
    if (a.leaf) {
      if (b.leaf) {
        return a.label.localeCompare(b.label)
      } else {
        return 1
      }
    } else {
      if (b.leaf) {
        return -1
      } else {
        return a.label.localeCompare(b.label)
      }
    }
  }
}
