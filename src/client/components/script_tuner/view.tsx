import { observer } from 'mobx-react'
import * as React from 'react'
import { ComponentType } from 'react'

import { Balance } from './balance/view'
import { ScriptTunerController } from './controller'
import { Controls } from './controls/view'
import { Editor } from './editor/view'
import { Explorer } from './explorer/view'
import { ScriptTunerModel } from './model'
import { ScriptTunerNetwork } from './network'
import { Preview } from './preview/view'
import * as style from './style.css'

export type ScriptTunerProps = {
  controller: ScriptTunerController
  menu: ComponentType<{}>
  model: ScriptTunerModel
  network: ScriptTunerNetwork
}

export const ScriptTuner = observer(({ controller, menu, model, network }: ScriptTunerProps) => {
  return (
    <div className={style.container}>
      <Explorer className={style.explorer} />
      <Preview className={style.preview} model={model} />
      <div className={style.balanceAndControls}>
        <Balance className={style.balance} />
        <Controls className={style.controls} />
      </div>
      <Editor className={style.editor} controller={controller} model={model} />
    </div>
  )
})
