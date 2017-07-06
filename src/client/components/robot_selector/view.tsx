import { observer } from 'mobx-react'
import * as React from 'react'
import { Dropdown } from '../dropdown/view'
import { dropdownContainer } from '../dropdown_container/view'
import { Switch } from '../switch/view'
import { RobotModel } from '../robot/model'
import Robot from './robot.svg'
import * as style from './style.css'

export type RobotSelectorProps = {
  robots: RobotModel[]
  selectRobot: (robot: RobotModel) => void
}

export const RobotSelector = observer((props: RobotSelectorProps) => {
  const { robots, selectRobot } = props
  const dropdownToggle = (
    <button className={style.button}>
      <Robot/>
      Select robots
    </button>
  )
  const onChange = (robot: RobotModel) => () => selectRobot(robot)
  const dropdownMenuStyle = { right: 0 }
  return (
    <div className={style.robotSelector}>
      <EnhancedDropdown dropdownToggle={dropdownToggle} dropdownMenuStyle={dropdownMenuStyle}>
        <div className={style.robots}>
          {robots.map(robot => {
            return (
              <label key={robot.name} className={style.robot}>
                <span className={style.robotLabel}>{robot.name}</span>
                <Switch on={robot.enabled} onChange={onChange(robot)} />
              </label>
            )
          })}
        </div>
      </EnhancedDropdown>
    </div>
  )
})

const EnhancedDropdown = dropdownContainer(Dropdown)
