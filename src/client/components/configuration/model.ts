import { action, observable } from 'mobx'
import { Node } from './tree/tree'

export class ConfigurationModel {
  @observable
  public files: Node

  @observable
  public selectedFile: Node

  constructor(opts: { files: Node }) {
    Object.assign(this, opts)
  }

  public static of(opts: { files: Node }) {
    return new ConfigurationModel(opts)
  }
}
