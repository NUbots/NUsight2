import * as React from 'react'
import { CSSProperties } from 'react'
import { ReactNode } from 'react'
import { MouseEvent } from 'react'
import { StatelessComponent } from 'react'
import * as style from './style.css'

export interface DropdownProps {
  children: ReactNode
  dropdownMenuStyle?: CSSProperties
  dropdownToggle: ReactNode
  isOpen: boolean
  onRef: (dropdown: HTMLDivElement) => void
  onToggleClick?: (event: MouseEvent<HTMLSpanElement>) => void
}

export const Dropdown: StatelessComponent<DropdownProps> = (props: DropdownProps) => {
  return (
    <div className={style.dropdown} ref={props.onRef}>
      <span className={style.dropdownToggle}
            onClick={props.onToggleClick}>
        {props.dropdownToggle}
      </span>
      {props.isOpen &&
        <div className={style.dropdownMenu} style={props.dropdownMenuStyle}>
          {props.children}
        </div>
      }
    </div>
  )
}
