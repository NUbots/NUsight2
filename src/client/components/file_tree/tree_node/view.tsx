import * as classNames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import { Collapsible } from '../../collapsible/view'
import { FileTreeController } from '../controller'
import { File, FileTreeModel, TreeNode } from '../model'

import DropdownIcon from './dropdown.svg'
import FileIcon from './file.svg'
import FolderIcon from './folder.svg'
import FolderOpenIcon from './folder_open.svg'
import * as style from './style.css'

export interface FileTreeNodeProps {
  controller: FileTreeController
  model: FileTreeModel
  node: TreeNode
  level: number
  animate?: boolean
  onSelect?(file: File): void
}

export const FileTreeNode = observer((props: FileTreeNodeProps) => {
  const { model, controller, node, level, animate, onSelect } = props

  const children = props.node.children
  const hasChildren = children.length > 0

  const onClick = () => {
    if (node.leaf) {
      controller.selectNode(node)
      onSelect && onSelect(node.file!) // The leaf node will always have a file
    } else {
      controller.toggleNode(node)
    }
  }

  // Using inline padding-left to indent so that the hover and selected background indicators
  // are full width. Padding is the default left padding of 8px plus each level's indent of 22px.
  const headerInlineStyle = {
    paddingLeft: 8 + (level * 22) + 'px',
  }

  const nodeHeaderClassNames = classNames(style.nodeHeader, {
    [style.nodeHeaderSelected]: model.selectedNode === node,
  })

  const dropdownIconClassNames = classNames(style.dropdownIcon, {
    [style.dropdownIconExpanded]: node.expanded,
    [style.dropdownIconAnimate]: animate,
  })

  return (
    <ul className={style.node}>
      <li>
        <div className={nodeHeaderClassNames} style={headerInlineStyle} onClick={onClick}>
          <div className={dropdownIconClassNames}>
            { hasChildren ? <DropdownIcon className={style.icon} /> : null }
          </div>

          <div className={style.nodeIcon}>
            {
              node.leaf
                ? <FileIcon className={style.icon} />
                : (
                    node.expanded
                      ? <FolderOpenIcon className={style.icon} />
                      : <FolderIcon className={style.icon} />
                  )
            }
          </div>

          <div className={style.nodeLabel}>{ node.label }</div>
        </div>

        <Collapsible open={node.expanded} className={style.nodeChildren} animate={animate}>
          { children.map((node, i) =>
              <FileTreeNode
                key={i}
                model={model}
                controller={controller}
                node={node}
                level={level + 1}
                animate={animate}
                onSelect={onSelect}
              />,
            )
          }
        </Collapsible>
      </li>
    </ul>
  )
})
