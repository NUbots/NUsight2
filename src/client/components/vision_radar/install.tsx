import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { VisionRadarView } from './view'

export function installVisionRadar({ nav, appModel, nusightNetwork }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork
}) {
  nav.addRoute({
    path: 'radar',
    Icon: () => <div>Radar Icon Here</div>,
    label: 'Vision Radar',
    Content: () => <VisionRadarView/>,
  })
}
