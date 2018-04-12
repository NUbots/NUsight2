import * as React from 'react'
import { ComponentType } from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import { ChartController } from './controller'
import Icon from './icon.svg'
import { ChartModel } from './model'
import { ChartNetwork } from './network'
import { ChartView } from './view'

export function installChart({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType
}) {
  const model = new ChartModel(appModel.robots)
  nav.addRoute({
    path: '/chart',
    exact: true,
    Icon,
    label: 'Chart',
    Content: () => {
      const network = ChartNetwork.of(nusightNetwork, model)
      const controller = ChartController.of({ model })
      return <ChartView controller={controller} Menu={menu} model={model} network={network} />
    },
  })
}