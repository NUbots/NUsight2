import { IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'

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
    return <SVGRenderer scene={viewModel.scene} camera={model.camera}/>
  }
}
