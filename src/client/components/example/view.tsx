import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { TreeNodeModel } from '../checkbox_tree/model'
import { CheckboxTree } from '../checkbox_tree/view'

import { ExampleController } from './controller'
import { Label } from './label/label'
import { ExampleModel } from './model'
import * as style from './style.css'

export type ExampleProps = {
  controller: ExampleController
  menu: ComponentType<{}>
  model: ExampleModel
}

@observer
export class Example extends Component<ExampleProps> {
  render() {
    const { controller, menu: Menu, model } = this.props

    const renderLabel = (node: TreeNodeModel) => {
      if (!node.leaf) {
        return <div>{ node.label }</div>
      }

      return <Label node={node} onColorChange={controller.onColorChange} />
    }

    return (
      <div className={style.page}>
        <Menu></Menu>
        <div className={style.example}>
          <div className={style.main}></div>
          <div className={style.sidebar}>
            <CheckboxTree
              model={model.tree}
              onCheck={controller.onNodeCheck}
              onExpand={controller.onNodeExpand}
              renderLabel={renderLabel}
            ></CheckboxTree>
          </div>
        </div>
      </div>
    )
  }
}
