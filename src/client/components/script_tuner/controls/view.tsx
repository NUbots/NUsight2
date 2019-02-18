import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

type ControlsProps = {
  className?: string
}

@observer
export class Controls extends React.Component<ControlsProps> {
  render() {
    return <div className={classNames([this.props.className, style.controls])}>
      <div className={style.controlsHeader}>
        <div className={style.controlsTitle}>Controls</div>
      </div>

      <div className={style.controlsBody}></div>
    </div>
  }
}
