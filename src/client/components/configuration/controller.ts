import { action, observable } from 'mobx'
import { ConfigurationModel } from './model'
import { TreeNode } from './model'
import { ConfigurationField } from './model'

export class ConfigurationController {
  private model: ConfigurationModel

  constructor(opts: { model: ConfigurationModel }) {
    Object.assign(this, opts)

    console.log(this.model)
  }

  public static of(opts: { model: ConfigurationModel }) {
    return new ConfigurationController(opts)
  }

  @action
  public updateSaveOnChange = (saveOnChange: boolean): void => {
    this.model.saveOnChange = saveOnChange
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

      if (!this.model.selectedFile.status.changed) {
        this.model.selectedFile.status.lastRevision = null
      }
    }

    node.selected = true
    node.status.lastRevision = JSON.stringify(node.data)

    this.model.selectedFile = node
  }

  @action
  public toggleNodeExpansion = (node: TreeNode) => {
    node.expanded = !node.expanded
  }

  @action
  public onEditorChange = (field: ConfigurationField, newValue: any, e: any) => {
    field.value = newValue

    if (this.model.selectedFile !== null) {
      this.model.selectedFile.status.changed = true

      const selectedFilePath = this.model.selectedFile.data!.path

      if (!this.model.changedFields[selectedFilePath]) {
        this.model.changedFields[selectedFilePath] = {}
      }

      this.model.changedFields[selectedFilePath][field.path!] = field
    }

    // TODO (Paye):
    // If in live (auto save) mode, send new value of field to robot, else
    // save it in the list of changes and send in all changes when the user clicks "Save"
  }
}
