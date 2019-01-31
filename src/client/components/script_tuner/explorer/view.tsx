import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import * as style from './style.css'

type ExplorerProps = {
  className?: string
}

@observer
export class Explorer extends React.Component<ExplorerProps> {
  render() {
    return <div className={classNames([this.props.className, style.explorer])}>
      <div className={style.explorerHeader}>
        <div className={style.explorerTitle}>Scripts</div>
      </div>

      <div className={style.explorerBody}></div>
    </div>
  }
}
