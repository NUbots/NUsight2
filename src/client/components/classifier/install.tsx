import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { ComponentType } from 'react'
import * as React from 'react'

import { NavigationConfiguration } from '../../navigation'
import { NUsightNetwork } from '../../network/nusight_network'
import { AppModel } from '../app/model'

import { installColorSpaceVisualizer } from './color_space_visualizer/install'
import { ClassifierController } from './controller'
import Icon from './icon.svg'
import { ClassifierRobotModel } from './model'
import { ClassifierModel } from './model'
import { ClassifierNetwork } from './network'
import { ClassifierRobotViewProps } from './view'
import { ClassifierRobotView } from './view'
import { ClassifierView } from './view'

export class ClassifierConfiguration {
  @observable.ref ColorSpaceVisualizer?: ComponentType<{ model: ClassifierRobotModel }>
  @observable.ref ClassifierRobotView?: ComponentType<ClassifierRobotViewProps>
}

export function installClassifier({ nav, appModel, nusightNetwork, Menu }: {
  appModel: AppModel,
  nusightNetwork: NUsightNetwork,
  nav: NavigationConfiguration,
  Menu: ComponentType
}) {
  const config = new ClassifierConfiguration()
  const model = ClassifierModel.of(appModel)

  installColorSpaceVisualizer({ config })
  installClassifierRobotView({ config })

  nav.addRoute({
    path: '/classifier',
    Icon,
    label: 'Classifier',
    Content: () => {
      const network = ClassifierNetwork.of(nusightNetwork)
      const controller = ClassifierController.of(network)
      return (
        <ClassifierView
          componentWillUnmount={controller.destroy}
          model={model}
          Menu={Menu}
          ClassifierRobotView={config.ClassifierRobotView}
        />
      )
    },
  })
}

const installClassifierRobotView = ({ config }: { config: ClassifierConfiguration }) => {
  config.ClassifierRobotView = observer((props: ClassifierRobotViewProps) => (
    <ClassifierRobotView {...props} ColorSpaceVisualizer={config.ColorSpaceVisualizer}/>
  ))
}