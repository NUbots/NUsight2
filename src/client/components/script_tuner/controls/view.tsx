import { observer } from 'mobx-react'
import * as React from 'react'

type ControlsProps = {
  className?: string
}

export const Controls = observer(({ className }: ControlsProps) => {
  return <div className={className}>Controls</div>
})
