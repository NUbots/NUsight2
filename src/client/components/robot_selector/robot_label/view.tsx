import * as classNames from 'classnames'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'

import { Collapsible } from '../../collapsible/view'
import { RobotModel } from '../../robot/model'
import { Switch } from '../../switch/view'
import { StatusIndicator } from '../status_indicator/view'

import DropdownIcon from './dropdown.svg'
import { formatSI } from './format-si'
import * as style from './style.css'
import { RobotLabelViewModel } from './view_model'

export type RobotLabelProps = {
  robot: RobotModel
  selectRobot(robot: RobotModel): void
}

export const RobotLabel = observer((props: RobotLabelProps) => {
  const { robot, selectRobot } = props
  const viewModel = RobotLabelViewModel.of(props.robot)

  const toggleRobot = (robot: RobotModel) => () => selectRobot(robot)
  const toggleStats = action(() => { viewModel.statsOpen = !viewModel.statsOpen })

  const dropdownButtonClassNames = classNames(style.statsDropdownButton, {
    [style.statsDropdownButtonOpen]: viewModel.statsOpen,
  })

  return <>
    <div className={style.robot}>
      <label className={style.robotLabel}>
        <StatusIndicator
          className={style.robotStatusIndicator}
          connected={robot.connected}
        />
        <span className={style.robotName}>{robot.name}</span>
        <span className={style.robotSwitch}>
          <Switch on={robot.enabled} onChange={toggleRobot(robot)} />
        </span>
      </label>
      <button className={dropdownButtonClassNames} onClick={toggleStats}>
        <DropdownIcon />
      </button>
    </div>
    <Collapsible open={viewModel.statsOpen} className={style.dataTable}>
      <div className={style.dataCell}>
        <div className={style.dataLabel}>Packets</div>
        <div className={style.dataValue}>{
          formatSI(viewModel.stats.packets)
        }</div>
      </div>
      <div className={style.dataCell}>
        <div className={style.dataLabel}>Packets/s</div>
        <div className={style.dataValue}>{
          formatSI(viewModel.stats.packetsPerSecond.rate)
        }</div>
      </div>
      <div className={style.dataCell}>
        <div className={style.dataLabel}>Bytes</div>
        <div className={style.dataValue}>{
          formatSI(viewModel.stats.bytes)
        }</div>
      </div>
      <div className={style.dataCell}>
        <div className={style.dataLabel}>Bytes/s</div>
        <div className={style.dataValue}>{
          formatSI(viewModel.stats.bytesPerSecond.rate)
        }</div>
      </div>
    </Collapsible>
  </>
})
