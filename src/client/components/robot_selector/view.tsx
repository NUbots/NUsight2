import * as React from 'react'
import { HTMLProps } from 'react'
import { inject, observer } from 'mobx-react'
import { AppModel } from '../app/model'
import { RobotModel } from '../robot/model'
import * as style from './style.css'

export interface RobotSelectorProps extends HTMLProps<HTMLSelectElement> {
  disabled?: boolean
  selectedRobot?: RobotModel
  selectRobot: (robot: RobotModel) => void
}

@observer
export class RobotSelector extends React.Component<RobotSelectorProps, any> {

  @inject(AppModel)
  private model: AppModel

  constructor(props: RobotSelectorProps, context: any) {
    super(props, context)
  }

  onChange = (event: { target: { value: string }}) => {
    const name = event.target.value
    const { robotStore } = this.props as RobotSelectorProps
    const robot = robotStore.find(robot => robot.name === name)
    this.props.selectRobot(robot)
  }

  public render(): JSX.Element {
    const { disabled, selectedRobot } = this.props as RobotSelectorProps
    const value = selectedRobot ? selectedRobot.name : undefined
    return (
      <select className={style.robots} disabled={disabled} value={value} onChange={this.onChange}>
        {robots.map(robot => <option value={robot.name} key={robot.name}>{robot.name}</option>}
      </select>
    )
  }

  public get robots(): RobotModel[] {
    return this.model.robots
  }

}
