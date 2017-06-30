import { action, observable } from 'mobx'
import { ConfigurationModel } from './model'
import { TreeNode } from './model'
import { ConfigurationField } from './editor/editor'

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
  public onEditorChange = (field: ConfigurationField, newValue: any, e: any) => {
    field.value = newValue

    // TODO (Paye):
    // If in live (auto save) mode, send new value of field to robot, else
    // save it in the list of changes and send in all changes when the user clicks "Save"
  }
}
