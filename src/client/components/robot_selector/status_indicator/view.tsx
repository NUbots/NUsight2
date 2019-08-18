import classNames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'

import style from './style.css'

export type StatusIndicatorProps = {
  className?: string
  connected: boolean
}

export const StatusIndicator = observer((props: StatusIndicatorProps) => {
  const { connected, className } = props
  const indicatorClassName = classNames(style.statusIndicator, className, {
    [style.statusConnected]: connected,
    [style.statusDisconnected]: !connected,
  })
  return (
    <span className={indicatorClassName} title={connected ? 'Connected' : 'Disconnected'}></span>
  )
})
