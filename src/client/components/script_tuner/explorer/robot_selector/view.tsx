import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { RobotModel } from '../../../robot/model'
import { Select, SelectOption } from '../../../select/view'

import PlugIcon from './plug.svg'
import RobotIcon from './robot.svg'
import * as style from './style.css'
import { RobotSelectorViewModel } from './view_model'

export type RobotSelectorProps = {
  className?: string
  robots: RobotModel[]
  selected?: RobotModel
  onSelect(robot: RobotModel): void
}

export const RobotSelector = observer((props: RobotSelectorProps) => {
  const { className, robots, selected, onSelect } = props
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
        onChange={(option: SelectOption & { robot: RobotModel }) => onSelect(option.robot)}
        placeholder='Select a robot...'
        empty={empty}
        icon={<RobotIcon />}
      />
    </div>
  )
})
