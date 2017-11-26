import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import Icon from './icon.svg'
import { VisionModel } from './model'
import { VisionNetwork } from './network'
import { VisionView } from './view'

export function installVision({ nav, appModel, nusightNetwork }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
}) {
  const model = VisionModel.of(appModel)
  nav.addRoute({
    path: '/vision',
    Icon,
    label: 'Vision',
    Content: () => {
      const network = VisionNetwork.of(nusightNetwork)
      return <VisionView model={model} network={network}/>
    },
  })
}
