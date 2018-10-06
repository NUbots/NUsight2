import { observer } from 'mobx-react'
import * as React from 'react'
import { ComponentType } from 'react'

import { ScriptTunerController } from './controller'
import { ScriptTunerModel } from './model'
import { ScriptTunerNetwork } from './network'
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
      <div className={style.viewer}>3d Robot View</div>
      <div className={style.editor}>Scripts Bar</div>
      <div className={style.balance}>Balance View</div>
      <div className={style.controls}>Controls</div>
    </div>
  )
})
