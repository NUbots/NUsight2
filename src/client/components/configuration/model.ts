import { action, observable } from 'mobx'

export interface ConfigurationField {
  type: string
  value: any
  tag?: string
  name?: string
  uid?: string
  path?: string
}

export interface ConfigurationFile {
  path: string,
  content: ConfigurationField
}

interface FileStatus {
  changed: boolean
  lastRevision?: string | null
}

export interface TreeNode {
  label: string
  expanded: boolean
  leaf: boolean
  selected: boolean
  data?: ConfigurationFile
  status: FileStatus
  children?: TreeNode[]
}

export class ConfigurationModel {
  @observable
  public files: TreeNode

  @observable
  public selectedFile: TreeNode | null = null

  @observable
  public changedFields: any = {}

  @observable
  public saveOnChange: boolean = false

  constructor(opts: { files: TreeNode }) {
    Object.assign(this, opts)
  }

  public static of(opts: { files: TreeNode }) {
    return new ConfigurationModel(opts)
  }
}
