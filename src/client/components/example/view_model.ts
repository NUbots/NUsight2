import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { observable } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

import { TreeData } from './model'
import { TreeDataPoint } from './model'

interface ExampleTreeViewModelOpts {
  model: TreeData | TreeDataPoint
  label: string
}

export class ExampleTreeViewModel implements TreeNodeModel {
  private model: TreeData | TreeDataPoint
  @observable label: string
  @observable expanded: boolean

  constructor(opts: ExampleTreeViewModelOpts) {
    this.model = opts.model
    this.label = opts.label
    this.expanded = false
  }

  static of = createTransformer((opts: ExampleTreeViewModelOpts): ExampleTreeViewModel => {
    return new ExampleTreeViewModel(opts)
  })

  @computed
  get leaf(): boolean {
    return this.model instanceof TreeDataPoint
  }

  @computed
  get checked(): CheckedState {
    if (this.leaf) {
      return (this.model as TreeDataPoint).checked
    }

    if (this.children.every(node => node.checked === CheckedState.Checked)) {
      return CheckedState.Checked
    }

    if (this.children.every(node => node.checked === CheckedState.Unchecked)) {
      return CheckedState.Unchecked
    }

    return CheckedState.Indeterminate
  }

  set checked(checked: CheckedState) {
    if (this.leaf) {
      (this.model as TreeDataPoint).checked = checked
    } else {
      this.children.forEach(child => {
        child.checked = checked
      })
    }
  }

  @computed
  get children(): TreeNodeModel[] {
    if (this.model instanceof TreeDataPoint) {
      return []
    }

    return Object.keys(this.model).map(key => ExampleTreeViewModel.of({
      label: key,
      model: (this.model as TreeData)[key],
    }))
  }
}
