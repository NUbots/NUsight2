import { computed } from 'mobx'
import { observable } from 'mobx'

import { CheckedState } from '../checkbox_tree/model'
import { createNodesFromData } from '../checkbox_tree/model'
import { TreeModel } from '../checkbox_tree/model'
import { TreeNodeModel } from '../checkbox_tree/model'

export class ExampleModel {
  @observable treeModel: TreeModel

  constructor() {
    const nodes = getSampleData()
    this.treeModel = TreeModel.of({ nodes })
  }

  static of(): ExampleModel {
    return new ExampleModel()
  }
}

function getSampleData(): TreeNodeModel[] {
  const x = 0
  const y = 0
  const z = 0
  const temperature = 0

  const data = {
    igus1: {
      sensors: {
        leftFootPosition: {
          x, y, z,
        },
        rightFootPosition: {
          x, y, z,
        },
        temperature,
      },
    },
    igus2: {
      sensors: {
        leftFootPosition: {
          x, y, z,
        },
        rightFootPosition: {
          x, y, z,
        },
        temperature,
      },
    },
  }

  return createNodesFromData(data)
}
