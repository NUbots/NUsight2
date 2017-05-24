import * as classnames from 'classnames'
import { observer } from 'mobx-react'
import * as React from 'react'

import FileIcon from './file.svg'
import FolderIconOpen from './folder-open.svg'
import FolderIcon from './folder.svg'
import * as style from './style.css'

export interface Node {
  label: string
  expanded: boolean
  leaf: boolean
  selected: boolean
  children?: Node[]
}

export interface TreeProps {
  data: Node
  level?: number
  onClick(node: Node): void
}

@observer
export class Tree extends React.Component<TreeProps, void> {
  public render(): JSX.Element {
    const children = this.props.data.children || []
    const hasChildren = children.length > 0
    const level = this.props.level || 0
    const classes = classnames(
      style.treenode,
      { [style['treenode--expanded']]: this.props.data.expanded },
      { [style['treenode--selected']]: this.props.data.selected },
    )
    const headerInlineStyle = { paddingLeft: 8 + (level * 22) + 'px' }

    return (
      <div className={classes}>
        <div className={style.treenode__header} onClick={this.onClick} style={headerInlineStyle}>
          <div className={style.treenode__icon}>
            {
              hasChildren ?
                (this.props.data.expanded ? <FolderIconOpen /> : <FolderIcon />) :
                <FileIcon />
            }
          </div>

          <div className={style.treenode__label}>{ this.props.data.label }</div>
        </div>

        {this.props.data.expanded &&
          <div className={style.treenode__children}>
            { children.map((child, i) => <Tree key={i} data={child} level={level + 1} onClick={this.props.onClick} />) }
          </div>
        }
      </div>
    )
  }

  private onClick = (e: any) => {
    this.props.onClick(this.props.data)
  }
}
