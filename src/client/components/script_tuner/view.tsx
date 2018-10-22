import { observer } from 'mobx-react'
import * as React from 'react'
import { ComponentType } from 'react'

import { Balance } from './balance/view'
import { ScriptTunerController } from './controller'
import { Controls } from './controls/view'
import { Editor } from './editor/view'
import { ScriptTunerModel } from './model'
import { ScriptTunerNetwork } from './network'
import * as style from './style.css'
import { Viewer } from './viewer/view'

export type ScriptTunerProps = {
  controller: ScriptTunerController
  menu: ComponentType<{}>
  model: ScriptTunerModel
  network: ScriptTunerNetwork
}

export const ScriptTuner = observer(({ controller, menu, model, network }: ScriptTunerProps) => {
  return (
    <div className={style.container}>
      <Viewer className={style.viewer} />
      <Balance className={style.balance} />
      <Editor className={style.editor} controller={controller} model={model} />
      <Controls className={style.controls} />
    </div>
  )
})
