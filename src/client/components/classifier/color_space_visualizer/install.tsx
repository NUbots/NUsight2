import * as React from 'react'

import { ClassifierConfiguration } from '../install'
import { ClassifierRobotModel } from '../model'

import { ColorSpaceVisualizerController } from './controller'
import { ColorSpaceVisualizerModel } from './model'
import { ColorSpaceVisualizer } from './view'

export const installColorSpaceVisualizer = ({ config }: {
  config: ClassifierConfiguration
}) => {
  config.ColorSpaceVisualizer = ({ model: classifierRobotModel }: { model: ClassifierRobotModel }) => {
    const model = ColorSpaceVisualizerModel.of(classifierRobotModel)
    const controller = ColorSpaceVisualizerController.of(model)
    return (
      <ColorSpaceVisualizer
        model={model}
        componentDidMount={controller.componentDidMount}
        componentWillUnmount={controller.componentWillUnmount}
        onMouseDown={controller.onMouseDown}
        onMouseMove={controller.onMouseMove}
        onMouseUp={controller.onMouseUp}
        onWheel={controller.onWheel}
      />
    )
  }
}
