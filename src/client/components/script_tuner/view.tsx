import { observer } from 'mobx-react'
import * as React from 'react'
import { ComponentType } from 'react'

import { ScriptTunerController } from './controller'
import { ScriptTunerModel } from './model'
import { ScriptTunerNetwork } from './network'

export type ScriptTunerProps = {
  controller: ScriptTunerController
  menu: ComponentType<{}>
  model: ScriptTunerModel
  network: ScriptTunerNetwork
}

export const ScriptTuner = observer(({ controller, menu, model, network }: ScriptTunerProps) => {
  return <div>Hello!</div>
})
