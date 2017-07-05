import * as React from 'react'
import * as style from './style.css'
import { Select, SelectOption } from '../select/view'
import { RobotPickerController } from './controller'
import { RobotPickerModel, Robot } from './model'
import { GlobalNetwork } from '../../network/global_network'
import { Network } from '../../network/network'

export interface RobotPickerProps {
  onChange: (robot: Robot) => void
}

export class RobotPicker extends React.Component<RobotPickerProps> {
  public props: RobotPickerProps
  private controller: RobotPickerController
  private model: RobotPickerModel

  public constructor(props: RobotPickerProps, context: any) {
    super(props, context)

    const model = new RobotPickerModel({ robots: [] })
    const globalNetwork = GlobalNetwork.of()
    const network = Network.of(globalNetwork)

    this.model = model
    this.controller = new RobotPickerController(model, network)
    this.onSelectChange = this.onSelectChange.bind(this)
  }

  public componentWillUnmount() {
    this.controller.destroy()
  }

  public render(): JSX.Element {
    return (
      <div className={style.robotPicker}>
        <Select
          label='Robot:'
          placeholder='Choose a robot'
          disabled={this.model.robots.length === 0}
          options={this.model.robots.map(robot => ({ data: robot, value: robot.name, label: robot.name }))}
          onChange={this.onSelectChange}
        />
      </div>
    )
  }

  public onSelectChange(selectedOption: SelectOption) {
    this.props.onChange(selectedOption.data)
  }
}
