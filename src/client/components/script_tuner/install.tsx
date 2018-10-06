import * as React from 'react'
import { ComponentType } from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import { ScriptTunerController } from './controller'
import Icon from './icon.svg'
import { ScriptTunerModel } from './model'
import { ScriptTunerNetwork } from './network'
import { ScriptTuner } from './view'

export function installScriptTuner({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType
}) {
  const model = ScriptTunerModel.of(appModel.robots)
  nav.addRoute({
    path: '/scripts',
    exact: true,
    Icon,
    label: 'Scripts',
    Content: () => {
      const network = ScriptTunerNetwork.of(nusightNetwork)
      const controller = ScriptTunerController.of(network)
      return <ScriptTuner controller={controller} menu={menu} model={model} network={network} />
    },
  })
}
