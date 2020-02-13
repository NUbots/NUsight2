import React from 'react'
import { ComponentType } from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import Icon from './icon.svg'
import { VisionModel } from './model'
import { VisionNetwork } from './network'
import { VisionView } from './view'

export function installVision2({ nav, appModel, nusightNetwork, Menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  Menu: ComponentType
}) {
  const model = VisionModel.of(appModel)
  nav.addRoute({
    path: '/vision2',
    Icon,
    label: 'Vision 2',
    Content: () => {
      const network = VisionNetwork.of(nusightNetwork)
      return <VisionView model={model} network={network} Menu={Menu}/>
    },
  })
}
