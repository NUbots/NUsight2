import * as React from 'react'
import { ComponentType } from 'react'
import { ReactNode } from 'react'
import { StatelessComponent } from 'react'
import * as style from './style.css'

export type MenuBarProps = {
  children?: ReactNode
  robotSelector: ComponentType<{}>
}

export const MenuBar: StatelessComponent<MenuBarProps> = (props: MenuBarProps) => {
  const RobotSelector = props.robotSelector
  return (
    <div className={style.menuBar}>
      <div className={style.menu}>
        {props.children}
      </div>
      <div className={style.robotSelector}>
        <RobotSelector />
      </div>
    </div>
  )
}
