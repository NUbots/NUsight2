import { observer } from 'mobx-react'
import * as React from 'react'

type ViewerProps = {
  className?: string
}

export const Viewer = observer(({ className }: ViewerProps) => {
  return <div className={className}>Viewer</div>
})
