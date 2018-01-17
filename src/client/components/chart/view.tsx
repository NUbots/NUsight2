import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

// import { FieldSelector } from './field_selector/view'
import { ChartModel } from './model'
import { ChartNetwork } from './network'
import * as style from './style.css'

export type ChartViewProps = {
  LineChart: ComponentType<{}>
  Menu: ComponentType<{}>
  model: ChartModel
  network: ChartNetwork
}

@observer
export class ChartView extends Component<ChartViewProps> {
  componentWillUnmount(): void {
    this.props.network.destroy()
  }

  render() {
    const { LineChart, Menu } = this.props
    // <FieldSelector />
    return (
      <div className={style.page}>
        <Menu />
        <div className={style.chart}>
          <div className={style.fieldSelector}>
          </div>
          <div className={style.lineChart}>
            <LineChart />
          </div>
        </div>
      </div>
    )
  }
}

