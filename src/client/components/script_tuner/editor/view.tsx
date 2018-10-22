import { observer } from 'mobx-react'
import * as React from 'react'

import { ScriptTunerController } from '../controller'
import { ScriptTunerModel } from '../model'

import { LineEditorController } from './line/controller'
import { LineEditor } from './line/view'
import * as style from './style.css'

type EditorProps = {
  className?: string
  controller: ScriptTunerController
  model: ScriptTunerModel
}

export const Editor = observer(({ className, controller, model }: EditorProps) => {
  const lineEditorController = LineEditorController.of()

  return <div className={style.editor}>
    <div className={style.editorHeader}>Editor</div>
    <div className={style.editorLines}>
      {
        model.servos.map((servo, index) => <LineEditor controller={lineEditorController} servo={servo} key={index} />)
      }
    </div>
  </div>
})
