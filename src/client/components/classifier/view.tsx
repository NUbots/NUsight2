import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ComponentType } from 'react'
import { ColorSpaceVisualizer } from './color_space_visualizer/view'
import { ClassifierRobotModel } from './model'
import * as styles from './styles.css'
import { ClassifierViewModel } from './view_model'
import { ClassifierRobotViewModel } from './view_model'

@observer
export class ClassifierView extends Component<{
  viewModel: ClassifierViewModel
  Menu: ComponentType,
  ClassifierRobotView?: ComponentType<ClassifierRobotViewProps>,
  componentWillUnmount(): void,
}> {
  public render() {
    const { viewModel, Menu, ClassifierRobotView } = this.props
    return (
      <div className={styles.classifier}>
        <Menu/>
        {ClassifierRobotView && viewModel.robots.map(robot => <ClassifierRobotView key={robot.id} viewModel={robot}/>)}
      </div>
    )
  }

  public componentWillUnmount() {
    this.props.componentWillUnmount()
  }
}

export type ClassifierRobotViewProps = {
  viewModel: ClassifierRobotViewModel,
}

@observer
export class ClassifierRobotView extends Component<ClassifierRobotViewProps & {
  ColorSpaceVisualizer?: ComponentType<{ classifierRobotModel: ClassifierRobotModel }>,
}> {
  public render() {
    const { viewModel, ColorSpaceVisualizer } = this.props
    return (
      <div className={styles.lutDisplay}>
        {ColorSpaceVisualizer && <ColorSpaceVisualizer classifierRobotModel={viewModel.model}/>}
      </div>
    )
  }
}
