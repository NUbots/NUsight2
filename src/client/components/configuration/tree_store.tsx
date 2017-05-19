import { action, observable } from 'mobx'
import { Node } from './tree/tree'

export class TreeStore {
  @observable
  public data: Node

  @observable
  public selectedNode: Node

  constructor(data: Node) {
    this.data = data
    this.onNodeClick = this.onNodeClick.bind(this)
  }

  @action
  public onNodeClick(node: Node): void {
    if (node.leaf) {
      this.selectNode(node)
    } else {
      this.toggleExpansion(node)
    }
  }

  @action
  public toggleExpansion(node: Node) {
    node.expanded = !node.expanded
  }

  @action
  public selectNode(node: Node) {
    if (this.selectedNode) {
      this.selectedNode.selected = false
    }

    node.selected = true
    this.selectedNode = node
  }
}
