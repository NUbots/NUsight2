import * as classnames from 'classnames'
import { autorun } from 'mobx'
import { IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import { ChangeEvent } from 'react'
import { Component } from 'react'
import { MouseEvent } from 'react'
import * as React from 'react'

import IconChevronDown from './chevron_down.svg'
import IconChevronRight from './chevron_right.svg'
import { CheckedState } from '../model'
import { TreeNodeModel } from '../model'
import * as style from './style.css'

export interface TreeNodeProps {
  node: TreeNodeModel
  level?: number
  onCheck?(node: TreeNodeModel): void
  onExpand?(node: TreeNodeModel): void
}

@observer
export class TreeNode extends Component<TreeNodeProps> {
  private checkbox: HTMLInputElement
  private stopAutorun: IReactionDisposer

  public componentDidMount() {
    if (!this.checkbox) {
      return
    }

    this.stopAutorun = autorun(() => this.updateCheckbox())
  }

  public componentWillUnmount() {
    this.stopAutorun()
  }

  public render(): JSX.Element {
    const children = this.props.node.children
    const hasChildren = children.length > 0
    const level = this.props.level || 0
    const classes = classnames(style.treenode)

    // Using inline paddingLeft to indent so that the hover and selected background indicators
    // are full width. Padding is the default left padding of 8px plus each level's indent of 22px.
    const headerInlineStyle = {
      paddingLeft: 8 + (level * 22) + 'px'
    }

    return (
      <ul className={classes}>
        <li>
          <div className={style.treenode__header} style={headerInlineStyle} onClick={this.onClick}>
            <div className={style.treenode__icon}>
              {
                hasChildren ?
                  (this.props.node.expanded ? <IconChevronDown /> : <IconChevronRight />) :
                  null
              }
            </div>

            <div className={style.treenode__checkbox}>
              <input
                type="checkbox"
                ref={this.onRef}
                onClick={this.onCheckboxClick}
                onChange={this.onCheckboxChange}
              />
            </div>

            <div className={style.treenode__label}>{ this.props.node.label }</div>
          </div>

          {this.props.node.expanded &&
            children.map((node, i) =>
              <TreeNode
                key={i}
                node={node}
                level={level + 1}
                onCheck={this.props.onCheck}
                onExpand={this.props.onExpand}
              />
            )
          }
        </li>
      </ul>
    )
  }

  private onRef = (checkbox: HTMLInputElement) => {
    this.checkbox = checkbox
  }

  private onClick = (event: MouseEvent<HTMLElement>) => {
    if (this.props.onExpand) {
      this.props.onExpand(this.props.node)
    }
  }

  private updateCheckbox = () => {
    if (this.props.node.checked === CheckedState.Checked) {
      this.checkbox.indeterminate = false
      this.checkbox.checked = true
    } else if (this.props.node.checked === CheckedState.Unchecked) {
      this.checkbox.indeterminate = false
      this.checkbox.checked = false
    } else {
      this.checkbox.indeterminate = true
    }
  }

  private onCheckboxClick = (event: MouseEvent<HTMLInputElement>) => {
    event.stopPropagation()
  }

  private onCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (this.props.onCheck) {
      this.props.onCheck(this.props.node)
    }
  }
}
