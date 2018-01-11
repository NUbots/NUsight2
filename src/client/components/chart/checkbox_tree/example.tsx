import { action } from 'mobx'
import { observable } from 'mobx'
import * as React from 'react'
import { StatelessComponent } from 'react'

import { CheckedState } from './model'
import { createNodesFromData } from './model'
import { TreeModel } from './model'
import { TreeNodeModel } from './model'
import { CheckboxTree } from './view'

export class ExampleController {
  private model: TreeModel

  constructor(opts: { model: TreeModel }) {
    Object.assign(this, opts)
  }

  public static of(opts: { model: TreeModel }) {
    return new ExampleController(opts)
  }

  @action
  public onNodeExpand = (node: TreeNodeModel): void => {
    node.expanded = !node.expanded
  }

  @action
  public onNodeCheck = (node: TreeNodeModel) => {
    if (node.leaf) {
      if (node.checkedState === CheckedState.Checked) {
        this.uncheckNode(node)
      } else {
        this.checkNode(node)
      }
    } else if (node.children.every(node => node.checkedState === CheckedState.Checked)) {
      this.uncheckNode(node)
    } else if (node.children.every(node => node.checkedState === CheckedState.Unchecked)) {
      this.checkNode(node)
    } else {
      if (this.model.usePessimisticToggle) {
        this.uncheckNode(node)
      } else {
        this.checkNode(node)
      }
    }
  }

  @action
  public checkNode = (node: TreeNodeModel) => {
    node.checkedState = CheckedState.Checked
    node.children.forEach(this.checkNode)
  }

  @action
  public uncheckNode = (node: TreeNodeModel) => {
    node.checkedState = CheckedState.Unchecked
    node.children.forEach(this.uncheckNode)
  }
}

export const ExampleCheckboxTree: StatelessComponent = () => {
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

  const nodes : TreeNodeModel[] = createNodesFromData(data)

  const model = TreeModel.of({ nodes })
  const controller = ExampleController.of({ model })

  return (
    <CheckboxTree model={model} onCheck={controller.onNodeCheck} onExpand={controller.onNodeExpand}></CheckboxTree>
  )
}
