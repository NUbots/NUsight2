import { IReactionDisposer } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import ReactResizeDetector from 'react-resize-detector'

import { SVGRenderer } from '../../../canvas/svg_renderer'

import { FieldModel } from './model'
import * as style from './style.css'
import { FieldViewModel } from './view_model'

export type FieldProps = {
  model: FieldModel
}

@observer
export class Field extends Component<FieldProps> {

  public render() {
    const model = this.props.model
    const viewModel = FieldViewModel.of(model)
    return <div className={style.container}>
      <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}/>
      <SVGRenderer className={style.field} scene={viewModel.scene} camera={model.camera}/>
    </div>
  }

  @action
  private onResize = (width: number, height: number) => {

    const m = this.props.model

    const fieldWidth = m.fieldWidth
    const fieldLength = m.fieldLength
    const scaleX = fieldLength / width
    const scaleY = fieldWidth / height

    const canvasAspect = width / height
    const fieldAspect = fieldLength / fieldWidth
    // Ensures the canvas is scaled such that the entire field is always visible, regardless of aspect ratio.
    const scale = canvasAspect > fieldAspect ? scaleY : scaleX

    m.camera.scale.x = scale
    m.camera.scale.y = -scale

    // Translate by half of the canvas width and height so that the field appears in the center.
    m.camera.translate.x = -width * 0.5
    m.camera.translate.y = -height * 0.5
  }
}
