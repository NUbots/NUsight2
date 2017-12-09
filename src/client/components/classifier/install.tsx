import { ComponentType } from 'react'
import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { ColorSpaceVisualzerModel } from './color_space_visualizer/model'
import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import { ClassifierController } from './controller'
import Icon from './icon.svg'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import { ClassifierView } from './view'
import { ClassifierViewModel } from './view_model'

export function installClassifier({ nav, appModel, nusightNetwork, Menu }: {
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  nav: NavigationConfiguration,
  Menu: ComponentType
}) {
  const model = ClassifierModel.of(appModel)
  const views = {
    ColorSpaceVisualizer() {
      const model = ColorSpaceVisualzerModel.of()
      return <ColorSpaceVisualizer model={model}/>
    },
  }
  nav.addRoute({
    path: '/classifier',
    Icon,
    label: 'Classifier',
    Content: () => {
      const network = ClassifierNetwork.of(nusightNetwork, model)
      const controller = ClassifierController.of(network)
      const viewModel = ClassifierViewModel.of(model)
      return (
        <ClassifierView
          controller={controller}
          viewModel={viewModel}
          Menu={Menu}
          ColorSpaceVisualizer={views.ColorSpaceVisualizer}
        />
      )
    },
  })
}
