import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { ScriptTunerModel } from '../model'
import { ModelVisualiser } from '../model_visualiser/view'

import * as style from './style.css'
import { ScriptRobot3dViewModel } from './view_model'

type ViewerProps = {
  className?: string
  model: ScriptTunerModel
}

@observer
export class Viewer extends React.Component<ViewerProps> {
  render() {
    const { model, className } = this.props
    const viewModel = ScriptRobot3dViewModel.of(model)

    return <div className={classNames([className, style.viewer])}>
      <div className={style.viewerHeader}>
        <div className={style.viewerTitle}>Viewer</div>
      </div>

      <div className={style.viewerBody}>
        <ModelVisualiser viewModel={viewModel}/>
        <div className={style.viewerHud}>
          <div className={style.viewerHudItems}>
            <span>{ model.isPlaying ? 'Playing' : 'Paused' }</span>
            <span>Time: {(Math.round(model.playTime * 1000) / 1000).toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  }
}
