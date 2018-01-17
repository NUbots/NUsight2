import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { CheckboxTree } from '../checkbox_tree/view'

import { ExampleController } from './controller'
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
    return (
      <div className={style.page}>
        <Menu></Menu>
        <div className={style.dashboard}>
          <CheckboxTree
            model={model.treeModel}
            onCheck={controller.onNodeCheck}
            onExpand={controller.onNodeExpand}
          ></CheckboxTree>
        </div>
      </div>
    )
  }
}
