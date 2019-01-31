import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { ScriptTunerModel } from '../model'
import { ModelVisualiser } from '../model_visualiser/view'

import * as style from './style.css'
import { ScriptRobot3dViewModel } from './view_model'

type PreviewProps = {
  className?: string
  model: ScriptTunerModel
}

@observer
export class Preview extends React.Component<PreviewProps> {
  render() {
    const { model, className } = this.props
    const viewModel = ScriptRobot3dViewModel.of(model)

    return <div className={classNames([className, style.preview])}>
      <div className={style.previewHeader}>
        <div className={style.previewTitle}>Preview</div>
      </div>

      <div className={style.previewBody}>
        <ModelVisualiser viewModel={viewModel}/>
        <div className={style.previewHud}>
          <div className={style.previewHudItems}>
            <span>{ model.isPlaying ? 'Playing' : 'Paused' }</span>
            <span>Time: {(Math.round(model.playTime * 1000) / 1000).toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  }
}
