import { action, observable } from 'mobx'

export interface TreeNode {
  label: string
  expanded: boolean
  leaf: boolean
  selected: boolean
  data?: any
  children?: TreeNode[]
}

export class ConfigurationModel {
  @observable
  public files: TreeNode

  @observable
  public selectedFile: TreeNode | null = null

  constructor(opts: { files: TreeNode }) {
    Object.assign(this, opts)
  }

  public static of(opts: { files: TreeNode }) {
    return new ConfigurationModel(opts)
  }
}
