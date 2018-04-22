import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { TreeNodeModel } from '../checkbox_tree/model'
import { CheckboxTree } from '../checkbox_tree/view'

import { ChartController } from './controller'
import { LineChartProps } from './line_chart/view'
import { LineChart } from './line_chart/view'
import { ChartModel } from './model'
import { ChartNetwork } from './network'
import * as style from './style.css'
import { TreeLabel } from './tree_label/view'

export type ChartViewProps = {
  Menu: ComponentType,
  model: ChartModel
  network: ChartNetwork,
  controller: ChartController
}

@observer
export class ChartView extends Component<ChartViewProps & {
  LineChart: ComponentType<LineChartProps>
}> {

  componentWillUnmount(): void {
    this.props.network.destroy()
  }

  render() {
    const { Menu, model, controller, LineChart } = this.props
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
        <div className={style.chart}>
          <div className={style.main}>
            <LineChart/>
          </div>
          <div className={style.sidebar}>
            <CheckboxTree
              model={model.tree}
              onCheck={controller.onNodeCheck}
              onExpand={controller.onNodeExpand}
              renderLabel={this.renderLabel}/>
          </div>
        </div>
      </div>
    )
  }

  renderLabel = (node: TreeNodeModel): JSX.Element | string => {
    return <TreeLabel
      node={node}
      onColorChange={this.props.controller.onColorChange}
      onMouseEnter={this.props.controller.onHighlight}
      onMouseLeave={this.props.controller.onUnhighlight}
    />
  }
}
