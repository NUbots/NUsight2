import * as React from 'react'
import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { ColorSpaceVisualzerModel } from './color_space_visualizer/model'
import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import Icon from './icon.svg'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import { ClassifierView } from './view'

export function installClassifier({ nav, appModel, nusightNetwork }: {
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  nav: NavigationConfiguration
}) {
  const model = ClassifierModel.of(appModel)
  const network = ClassifierNetwork.of(nusightNetwork, model)
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
    Content: () => <ClassifierView model={model} network={network} ColorSpaceVisualizer={views.ColorSpaceVisualizer}/>,
  })
}
