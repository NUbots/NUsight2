import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import Icon from './icon.svg'
import { VisionModel } from './model'
import { VisionNetwork } from './network'
import { VisionView } from './view'
import { ComponentType } from 'react'

export function installVision({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType,
}) {
  const model = VisionModel.of(appModel)
  nav.addRoute({
    path: '/vision',
    Icon,
    label: 'Vision',
    Content: () => {
      const network = VisionNetwork.of(nusightNetwork)
      return <VisionView model={model} network={network} menu={menu}/>
    },
  })
}
