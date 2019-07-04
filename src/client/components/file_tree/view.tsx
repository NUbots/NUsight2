import { observer } from 'mobx-react'
import * as React from 'react'

import { FileTreeController } from './controller'
import { FileTreeModel } from './model'
import { File } from './model'
import * as style from './style.css'
import { FileTreeNode } from './tree_node/view'

export type FileBrowserProps = {
  files: File[]
  animate?: boolean
  onSelect?(file: File): void
}

export const FileBrowser = observer((props: FileBrowserProps) => {
  const model = FileTreeModel.of(props.files)
  const controller = FileTreeController.of(model)

  return <div>
    { model.rootNode.children.length === 0 && <div className={style.placeholder}>No files</div> }
    { model.rootNode.children.map((node, i) => (
      <FileTreeNode
        key={i}
        model={model}
        controller={controller}
        node={node}
        level={0}
        animate={props.animate}
        onSelect={props.onSelect}
      />
    )) }
  </div>
})
