import { createTransformer } from 'mobx'
import { computed } from 'mobx'
import { observable } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { TreeModel } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

import { ExampleTreeViewModel } from './view_model'

export interface TreeData {
  [key: string]: TreeData | TreeDataPoint
}

export class TreeDataPoint {
  @observable color: string
  @observable checked: CheckedState

  constructor({ color = '#ff0000', checked = CheckedState.Unchecked }: Partial<TreeDataPoint> = {}) {
    this.color = color
    this.checked = checked
  }
}

export class ExampleModel {
  @observable treeData: TreeData

  constructor(data: TreeData) {
    this.treeData = data
  }

  static of(data: TreeData): ExampleModel {
    return new ExampleModel(data)
  }

  @computed
  get tree() {
    return {
      nodes: Object.keys(this.treeData).map(key => ExampleTreeViewModel.of({
        label: key,
        model: this.treeData[key],
      })),
      usePessimisticToggle: true,
    }
  }
}
