import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'
import { MouseEvent } from 'react'
import { ReactNode } from 'react'

import * as style from './style.css'

export type ButtonProps = {
  className?: string
  type?: 'normal' | 'primary'
  fullwidth?: boolean
  textAlign?: 'left' | 'center' | 'right'
  disabled?: boolean
  iconBefore?: ReactNode
  iconAfter?: ReactNode
  iconAfterAlignedRight?: boolean
  children?: any
  onClick?(event: MouseEvent<HTMLButtonElement>): void
}

export const Button: React.StatelessComponent<ButtonProps> = observer((props: ButtonProps) => {
  const {
    className,
    type = 'normal',
    fullwidth,
    textAlign = 'center',
    disabled,
    iconBefore,
    iconAfter,
    iconAfterAlignedRight,
    children,
    onClick,
  } = props

  const typeClassName = type === 'primary' ? style.buttonPrimary : style.buttonNormal
  const fullwidthClassName = fullwidth ? style.fullwidth : ''
  const iconAfterClassName = iconAfterAlignedRight ? style.iconAfterAlignedRight : ''
  const alignClassName = textAlign === 'center'
    ? '' // the default alignment is center
    : textAlign === 'left'
        ? style.alignLeft
        : style.alignRight

  const buttonClassNames = classNames([
    style.button,
    typeClassName,
    fullwidthClassName,
    iconAfterClassName,
    alignClassName,
    className,
  ])

  return <button className={buttonClassNames} onClick={onClick} disabled={disabled}>
    { iconBefore && <span className={style.iconBefore}>{ iconBefore }</span> }
    { children }
    { iconAfter &&
      <span className={classNames([style.iconAfter, iconAfterClassName])}>
        { iconAfter }
      </span>
    }
  </button>
})
