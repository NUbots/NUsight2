import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { ColorResult } from 'react-color'
import { TwitterPicker } from 'react-color'

import { TreeNodeModel } from '../../checkbox_tree/model'
import { ExampleTreeViewModel } from '../view_model'

import * as style from './style.css'

type LabelProps = {
  node: TreeNodeModel
  onColorChange?(color: string, node: TreeNodeModel): void
}

@observer
export class Label extends Component<LabelProps> {
  state = {
    showColorPicker: false,
  }

  render() {
    const node = this.props.node

    if (!(node instanceof ExampleTreeViewModel)) {
      throw new Error(`Unsupported node type: ${node}`)
    }

    if (!node.leaf) {
      return <div>{ node.label }</div>
    }

    return (
      <div className={style.label}>
        <span className={style.labelName}>{ node.label }</span>

        <button
          className={style.pickerButton}
          onClick={this.togglePicker}
          style={{ backgroundColor: node.color }}
        ></button>

        { this.state.showColorPicker &&
          <div className={style.pickerPopover}>
            <div className={style.pickerPopoverCover} onClick={ this.closePicker }></div>
            <TwitterPicker color={node.color} onChangeComplete={this.onColorChange} triangle='hide' />
          </div>
        }
      </div>
    )
  }

  onColorChange = (color: ColorResult) => {
    if (this.props.onColorChange) {
      this.props.onColorChange(color.hex, this.props.node)
      this.closePicker()
    }
  }

  togglePicker = () => {
    this.setState({ showColorPicker: !this.state.showColorPicker })
  }

  closePicker = () => {
    this.setState({ showColorPicker: false })
  }
}
