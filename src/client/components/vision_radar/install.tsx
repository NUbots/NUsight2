import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { VisionRadarView } from './view'
import { VisionRadarModel } from './model'
import Icon from './icon.svg'

export function installVisionRadar({ nav, appModel, nusightNetwork }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork
}) {
  const model = VisionRadarModel.of(appModel)
  nav.addRoute({
    path: '/radar',
    Icon,
    label: 'Vision Radar',
    Content: () => <VisionRadarView model={model}/>,
  })
}
