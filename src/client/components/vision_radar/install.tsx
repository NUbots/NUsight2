import * as React from 'react'
import { ComponentType } from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import Icon from './icon.svg'
import { VisionRadarModel } from './model'
import { VisionRadarNetwork } from './network'
import { VisionRadarView } from './view'
import { VisionRadarViewModel } from './view_model'

export function installVisionRadar({ nav, appModel, nusightNetwork, Menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  Menu: ComponentType
}) {
  const model = VisionRadarModel.of(appModel)
  nav.addRoute({
    path: '/radar',
    Icon,
    label: 'Vision Radar',
    Content: () => {
      const viewModel = VisionRadarViewModel.of(model)
      const network = VisionRadarNetwork.of(nusightNetwork)
      return <VisionRadarView viewModel={viewModel} network={network} Menu={Menu}/>
    },
  })
}
