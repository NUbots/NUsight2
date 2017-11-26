import { ComponentType } from 'react'
import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { LocalisationController } from './controller'
import Icon from './icon.svg'
import { LocalisationModel } from './model'
import { LocalisationNetwork } from './network'
import { LocalisationView } from './view'

export function installLocalisation({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType
}) {
  const model = LocalisationModel.create(appModel)
  nav.addRoute({
    path: '/localisation',
    Icon,
    label: 'Localisation',
    Content: () => {
      const network = LocalisationNetwork.create(nusightNetwork, model)
      const controller = LocalisationController.create()
      return <LocalisationView controller={controller} menu={menu} model={model} network={network}/>
    },
  })
}
