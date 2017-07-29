import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
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
  public componentWillUnmount(): void {
    this.props.network.destroy()
  }

  public render() {
    const { LineChart, Menu } = this.props
    return (
      <div className={style.page}>
        <Menu />
        <div className={style.chart}>
          <LineChart />
        </div>
      </div>
    )
  }
}

