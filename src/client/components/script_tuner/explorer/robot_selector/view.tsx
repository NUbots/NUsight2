import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { RobotModel } from '../../../robot/model'
import { Option, Select } from '../../../select/view'

import PlugIcon from './plug.svg'
import RobotIcon from './robot.svg'
import * as style from './style.css'
import { RobotSelectorViewModel } from './view_model'

export type RobotSelectorProps = {
  className?: string
  robots: RobotModel[]
  selected?: RobotModel
  dropDirection?: 'up' | 'down'
  onSelect(robot: RobotModel): void
}

@observer
export class RobotSelector extends React.Component<RobotSelectorProps> {
  render() {
    const { className, robots, selected, dropDirection } = this.props
    const viewModel = RobotSelectorViewModel.of({
      robots,
      selected,
    })

    const empty = (
      <div className={style.empty}>
        <div className={style.emptyIcon}><PlugIcon /></div>
        <div className={style.emptyTitle}>No connected robots</div>
        <span className={style.emptyDescription}>Run yarn start:sim to simulate robots</span>
      </div>
    )

    return (
      <div className={classNames([style.robotSelector, className])}>
        <Select
          options={viewModel.options}
          selectedOption={viewModel.selectedOption}
          onChange={this.onChange}
          placeholder='Select a robot...'
          empty={empty}
          icon={<RobotIcon />}
          dropDirection={dropDirection}
        />
      </div>
    )
  }

  private onChange = (option: Option & { robot: RobotModel }) => {
    this.props.onSelect(option.robot)
  }
}
