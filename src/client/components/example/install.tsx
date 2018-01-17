import * as React from 'react'
import { ComponentType } from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import { ExampleController } from './controller'
import Icon from './icon.svg'
import { ExampleModel } from './model'
import { Example } from './view'

export function installExample({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType
}) {
  const model = ExampleModel.of()
  nav.addRoute({
    path: '/example',
    exact: true,
    Icon,
    label: 'Example',
    Content: () => {
      const model = ExampleModel.of()
      const controller = ExampleController.of({ model })
      return <Example controller={controller} menu={menu} model={model} />
    },
  })
}
