import * as React from 'react'
import { ComponentType } from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import { ExampleController } from './controller'
import Icon from './icon.svg'
import { ExampleModel } from './model'
import { TreeData } from './model'
import { TreeDataPoint } from './model'
import { Example } from './view'

export function installExample({ nav, appModel, nusightNetwork, menu }: {
  nav: NavigationConfiguration,
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  menu: ComponentType
}) {
  nav.addRoute({
    path: '/example',
    exact: true,
    Icon,
    label: 'Example',
    Content: () => {
      const data = getSampleData()
      const model = ExampleModel.of(data)
      const controller = ExampleController.of({ model })
      return <Example controller={controller} menu={menu} model={model} />
    },
  })
}

// This is generates sample data, real data will probably come from the network.
function getSampleData(): TreeData {
  return {
    igus1: {
      sensors: {
        leftFootPosition: {
          x: new TreeDataPoint(),
          y: new TreeDataPoint(),
          z: new TreeDataPoint(),
        },
        rightFootPosition: {
          x: new TreeDataPoint(),
          y: new TreeDataPoint(),
          z: new TreeDataPoint(),
        },
        temperature: new TreeDataPoint(),
      },
    },
    igus2: {
      sensors: {
        leftFootPosition: {
          x: new TreeDataPoint(),
          y: new TreeDataPoint(),
          z: new TreeDataPoint(),
        },
        rightFootPosition: {
          x: new TreeDataPoint(),
          y: new TreeDataPoint(),
          z: new TreeDataPoint(),
        },
        temperature: new TreeDataPoint(),
      },
    },
  }
}
