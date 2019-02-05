import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

type LoadingIconProps = {
  className?: string
  size?: number
}

@observer
export class LoadingIcon extends React.Component<LoadingIconProps> {
  render() {
    const { className, size = 32 } = this.props
    return <div
      className={classNames([style.loading, className])}
      style={{ width: size + 'px', height: size + 'px' }}
    >
      <svg role="progressbar" viewBox="25 25 50 50">
        <circle
          cx="50"
          cy="50"
          fill="none"
          r="20"
          strokeMiterlimit="10"
          strokeWidth="4"
        ></circle>
      </svg>
    </div>
  }
}
