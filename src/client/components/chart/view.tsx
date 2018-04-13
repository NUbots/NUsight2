import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { CheckboxTree } from '../checkbox_tree/view'

import { ChartController } from './controller'
import { LineChart } from './line_chart/view'
import { ChartModel } from './model'
import { ChartNetwork } from './network'
import * as style from './style.css'

export type ChartViewProps = {
  Menu: ComponentType<{}>
  model: ChartModel
  network: ChartNetwork,
  controller: ChartController
}

@observer
export class ChartView extends Component<ChartViewProps> {

  componentWillUnmount(): void {
    this.props.network.destroy()
    this.props.controller.destroy()
  }

  render() {
    const { Menu, model, controller } = this.props
    return (
      <div className={style.page}>
        <Menu>
         <ul className={style.menu}>
            <li className={style.menuItem}>
              <button className={style.menuButton}>Line Chart</button>
              <button className={style.menuButton}>2D Scatter</button>
            </li>
          </ul>
        </Menu>
        <div className={style.example}>
          <div className={style.main}>
            <LineChart model={model} />
          </div>
          <div className={style.sidebar}>
            <CheckboxTree
              model={model.tree}
              onCheck={controller.onNodeCheck}
              onExpand={controller.onNodeExpand} />
          </div>
        </div>
      </div>
    )
  }
}
