import { action, observable } from 'mobx'
import { ConfigurationModel } from './model'
import { Node } from './tree/tree'

export class ConfigurationController {
  private model: ConfigurationModel

  constructor(opts: { model: ConfigurationModel }) {
    Object.assign(this, opts)
  }

  public static of(opts: { model: ConfigurationModel }) {
    return new ConfigurationController(opts)
  }

  @action
  public onNodeClick = (node: Node): void => {
    if (node.leaf) {
      this.selectNode(node)
    } else {
      this.toggleNodeExpansion(node)
    }
  }

  @action
  public selectNode = (node: Node) => {
    if (this.model.selectedFile) {
      this.model.selectedFile.selected = false
    }

    node.selected = true
    this.model.selectedFile = node
  }

  @action
  public toggleNodeExpansion = (node: Node) => {
    node.expanded = !node.expanded
  }
}
