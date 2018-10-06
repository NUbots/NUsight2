import { observer } from 'mobx-react'
import * as React from 'react'

type EditorProps = {
  className?: string
}

export const Editor = observer(({ className }: EditorProps) => {
  return <>Editor</>
})
