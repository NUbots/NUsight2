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
      { [style['treenode--selected']]: this.props.data.selected },
    )

    // We're using inline padding-left to indent so that the hover and selected indicators
    // are full width. Indentation is the default 8px plus the level's indent of 22px.
    const headerInlineStyle = { paddingLeft: 8 + (level * 22) + 'px' }

    return (
      <ul className={classes}>
        <li>
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
            children.map((child, i) => <Tree key={i} data={child} level={level + 1} onClick={this.props.onClick} />)
          }
        </li>
      </ul>
    )
  }

  private onClick = (e: any) => {
    this.props.onClick(this.props.data)
  }
}
