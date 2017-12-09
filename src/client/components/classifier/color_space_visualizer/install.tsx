import * as React from 'react'
import { ClassifierConfiguration } from '../install'
import { ClassifierRobotModel } from '../model'
import { ColorSpaceVisualizerController } from './controller'
import { ColorSpaceVisualzerModel } from './model'
import { ColorSpaceVisualizer } from './view'
import { ColorSpaceVisualizerViewModel } from './view_model'

export const installColorSpaceVisualizer = ({ config }: {
  config: ClassifierConfiguration,
}) => {
  config.ColorSpaceVisualizer = ({ classifierRobotModel }: { classifierRobotModel: ClassifierRobotModel }) => {
    const model = ColorSpaceVisualzerModel.of(classifierRobotModel)
    const controller = ColorSpaceVisualizerController.of(model)
    const viewModel = ColorSpaceVisualizerViewModel.of(model)
    return (
      <ColorSpaceVisualizer
        viewModel={viewModel}
        componentDidMount={controller.componentDidMount}
        componentWillUnmount={controller.componentWillUnmount}
      />
    )
  }
}
