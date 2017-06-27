import { action, observable } from 'mobx'
import { ConfigurationModel } from './model'
import { TreeNode } from './model'

export class ConfigurationController {
  private model: ConfigurationModel

  constructor(opts: { model: ConfigurationModel }) {
    Object.assign(this, opts)
  }

  public static of(opts: { model: ConfigurationModel }) {
    return new ConfigurationController(opts)
  }

  @action
  public onNodeClick = (node: TreeNode): void => {
    if (node.leaf) {
      this.selectNode(node)
    } else {
      this.toggleNodeExpansion(node)
    }
  }

  @action
  public selectNode = (node: TreeNode) => {
    if (this.model.selectedFile) {
      this.model.selectedFile.selected = false
    }

    node.selected = true
    this.model.selectedFile = node
  }

  @action
  public toggleNodeExpansion = (node: TreeNode) => {
    node.expanded = !node.expanded
  }

  @action
  public onEditorChange = () => {
    // console.log('Editor field changed')
  }
}
