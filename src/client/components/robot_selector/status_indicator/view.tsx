import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

export type StatusIndicatorProps = {
  className?: string
  connected: boolean
  flash: boolean
}

export const StatusIndicator = observer((props: StatusIndicatorProps) => {
  const { connected, flash, className } = props
  const indicatorClassName = classNames(style.statusIndicator, className, {
    [style.statusConnected]: connected,
    [style.statusDisconnected]: !connected,
    [style.flash]: flash,
  })
  return (
    <span className={indicatorClassName} title={connected ? 'Connected' : 'Disconnected'}></span>
  )
})
