import { observer } from 'mobx-react'
import * as React from 'react'

type BalanceProps = {
  className?: string
}

export const Balance = observer(({ className }: BalanceProps) => {
  return <div className={className}>Balance</div>
})
