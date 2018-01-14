import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'

import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import { ClassifierModel } from './model'
import { ClassifierRobotModel } from './model'
import * as styles from './styles.css'

@observer
export class ClassifierView extends Component<{
  model: ClassifierModel,
  Menu: ComponentType,
  ClassifierRobotView?: ComponentType<ClassifierRobotViewProps>,
  componentWillUnmount(): void
}> {
  render() {
    const { model, Menu, ClassifierRobotView } = this.props
    return (
      <div className={styles.classifier}>
        <Menu/>
        {ClassifierRobotView && model.robots
          .filter(robot => robot.visible)
          .map(robot => robot.visible && <ClassifierRobotView key={robot.id} model={robot}/>)}
      </div>
    )
  }

  componentWillUnmount() {
    this.props.componentWillUnmount()
  }
}

export type ClassifierRobotViewProps = {
  model: ClassifierRobotModel
}

@observer
export class ClassifierRobotView extends Component<ClassifierRobotViewProps & {
  ColorSpaceVisualizer?: ComponentType<{ model: ClassifierRobotModel }>
}> {
  render() {
    const { model, ColorSpaceVisualizer } = this.props
    return (
      <div className={styles.lutDisplay}>
        {ColorSpaceVisualizer && <ColorSpaceVisualizer model={model}/>}
      </div>
    )
  }
}
