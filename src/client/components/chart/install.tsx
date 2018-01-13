import * as React from 'react'
import { ComponentType } from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { LineChartController } from './line_chart/controller'
import { LineChart } from './line_chart/view'
import { ChartModel } from './model'
import { ChartNetwork } from './network'
import { ChartView } from './view'
import Icon from './icon.svg'

export function installChart({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType
}) {
  const model = ChartModel.of(appModel.robots)
  nav.addRoute({
    path: '/chart',
    exact: true,
    Icon,
    label: 'Chart',
    Content: () => {
      const lineChart = () => <LineChart controller={LineChartController.of()} model={model.lineChart} />
      const network = ChartNetwork.of(nusightNetwork)
      return <ChartView LineChart={lineChart} Menu={menu} model={model} network={network} />
    },
  })
}
