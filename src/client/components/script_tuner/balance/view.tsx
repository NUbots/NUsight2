import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

type BalanceProps = {
  className?: string
}

@observer
export class Balance extends React.Component<BalanceProps> {
  render() {
    return <div className={classNames([this.props.className, style.balance])}>
      <div className={style.balanceHeader}>
        <div className={style.balanceTitle}>Balance</div>
      </div>

      <div className={style.balanceBody}></div>
    </div>
  }
}
