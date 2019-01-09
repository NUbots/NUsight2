import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { ScriptTunerModel } from '../model'

import * as style from './style.css'
import { ViewerViewModel } from './view_model'

type ViewerProps = {
  className?: string
  model: ScriptTunerModel
}

export const Viewer = observer(({ className, model }: ViewerProps) => {
  const viewModel = ViewerViewModel.of(model)

  return <div className={classNames([className, style.viewer])}>
    <div className={style.viewerHeader}>
      <div className={style.viewerTitle}>Viewer</div>
    </div>

    <div className={style.viewerBody}>
      <div>Time: { model.currentTime }</div>
      <div>{ model.isPlaying ? 'Playing' : 'Paused' }</div>
      <ol>
        { viewModel.servos.map(servo => <li>
            { '[' + servo[0] + ', ' + servo[1] + ']' }
          </li>)
        }
      </ol>
    </div>
   </div>
})
