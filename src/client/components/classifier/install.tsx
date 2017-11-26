import * as React from 'react'
import { NavigationBuilder } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'
import { ColorSpaceVisualzerModel } from './color_space_visualizer/model'
import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import { ClassifierView } from './view'
import CubeIcon from '../navigation/icons/cube.svg'

export function installClassifier({ appModel, nusightNetwork, nav }: {
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  nav: NavigationBuilder
}) {
  const model = ClassifierModel.of(appModel)
  const network = ClassifierNetwork.of(nusightNetwork, model)
  const views = {
    ColorSpaceVisualizer() {
      const model = ColorSpaceVisualzerModel.of()
      return <ColorSpaceVisualizer model={model}/>
    }
  }
  nav.add({
    route: '/classifier',
    tab: { icon: CubeIcon, text: 'Classifier' },
    Content: () => <ClassifierView model={model} network={network} ColorSpaceVisualizer={views.ColorSpaceVisualizer}/>,
  })
}
