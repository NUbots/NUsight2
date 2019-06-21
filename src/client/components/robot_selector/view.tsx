import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { dropdownContainer } from '../dropdown_container/view'
import { RobotModel } from '../robot/model'
import { Switch } from '../switch/view'

import PlugIcon from './plug.svg'
import RobotIcon from './robot.svg'
import * as style from './style.css'

export type RobotSelectorProps = {
  dropdownMenuPosition?: 'left' | 'right'
  robots: RobotModel[]
  selectRobot(robot: RobotModel): void
}

export const RobotSelector = observer((props: RobotSelectorProps) => {
  const { robots, selectRobot } = props
  const dropdownToggle = (
    <button className={style.button}>
      <RobotIcon />
      Select robots
    </button>
  )
  const onChange = (robot: RobotModel) => () => selectRobot(robot)
  return (
    <div className={style.robotSelector}>
      <EnhancedDropdown dropdownToggle={dropdownToggle} dropdownPosition={props.dropdownMenuPosition}>
        <div className={style.robots}>
          {robots.length === 0 &&
            <div className={style.empty}>
              <div className={style.emptyIcon}>
                <PlugIcon />
              </div>
              <div className={style.emptyTitle}>
                No connected robots
              </div>
              <span className={style.emptyDescription}>
                Run yarn start:sim to simulate robots
              </span>
            </div>
          }
          {robots.map(robot => {
            const indicatorClassName = classNames(style.robotConnectionIndicator, {
              [style.robotConnected]: robot.connected,
              [style.robotDisconnected]: !robot.connected,
            })
            return (
              <label key={robot.id} className={style.robot}>
                <span className={indicatorClassName} title={robot.connected ? 'Connected' : 'Disconnected'}></span>
                <span className={style.robotLabel}>{robot.name}</span>
                <span className={style.robotDataRate} title={robot.dataRates.bytes.rate.toFixed(2) + 'bps'}>
                  { robot.dataRates.packets.rate.toFixed(2) }pps
                </span>
                <Switch on={robot.enabled} onChange={onChange(robot)} />
              </label>
            )
          })}
        </div>
      </EnhancedDropdown>
    </div>
  )
})

const EnhancedDropdown = dropdownContainer()
