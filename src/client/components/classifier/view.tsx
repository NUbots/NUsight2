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

  public render() {
    const { model, Menu, ClassifierRobotView } = this.props
    return (
      <div className={styles.classifier}>
        <Menu/>
        {ClassifierRobotView && model.robots.map(robot => <ClassifierRobotView key={robot.id} model={robot}/>)}
      </div>
    )
  }

  public componentWillUnmount() {
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
  public render() {
    const { model, ColorSpaceVisualizer } = this.props
    return (
      <div className={styles.lutDisplay}>
        {ColorSpaceVisualizer && <ColorSpaceVisualizer model={model}/>}
      </div>
    )
  }
}
