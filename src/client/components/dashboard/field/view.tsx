import { action } from 'mobx'
import { autorun } from 'mobx'
import { IReactionDisposer } from 'mobx'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Component } from 'react'
import { CanvasRenderer } from '../../../canvas/renderer'
import { Transform } from '../../../math/transform'
import { FieldModel } from './model'
import { FieldViewModel } from './view_model'
import * as style from './style.css'

export type FieldProps = {
  model: FieldModel
}

@observer
export class Field extends Component<FieldProps> {
  private field: HTMLCanvasElement
  @observable private height: number = 0
  @observable private width: number = 0
  private rafId: number
  private renderer: CanvasRenderer
  private stopAutorun: IReactionDisposer

  public componentDidMount() {
    if (!this.field) {
      return
    }
    const context: CanvasRenderingContext2D = this.field.getContext('2d')!
    this.renderer = CanvasRenderer.of(context)
    this.stopAutorun = autorun(() => this.renderField())
    this.rafId = requestAnimationFrame(this.onAnimationFrame)
  }

  public componentWillUnmount() {
    cancelAnimationFrame(this.rafId)
  }

  public render() {
    return (
      <canvas width={this.width}
              height={this.height}
              className={style.field}
              ref={this.onRef} />
    )
  }

  private onAnimationFrame = () => {
    this.rafId = requestAnimationFrame(this.onAnimationFrame)
    const width = this.field.clientWidth
    const height = this.field.clientHeight
    if (width !== this.field.width || height !== this.field.height) {
      this.updateField(width, height)
      this.renderField()
    }
  }

  private onRef = (field: HTMLCanvasElement) => {
    this.field = field
  }

  private renderField(): void {
    const viewModel = FieldViewModel.of(this.props.model)
    const fieldWidth = this.props.model.fieldWidth + 1
    const fieldLength = this.props.model.fieldLength + 1
    const width = this.field.clientWidth
    const height = this.field.clientHeight

    const scaleX = width / fieldLength
    const scaleY = height / fieldWidth

    const canvasAspect = height / width
    const fieldAspect = fieldWidth / fieldLength
    const scale = canvasAspect < fieldAspect ? scaleY : scaleX

    const camera = Transform.of({
      // Rotate the field by -90deg so that the sidelines are on the top and bottom of the screen.
      rotate: Math.PI * 0.5,
      scale,
      // Translate by half of the canvas width and height so that the field appears in the center.
      translate: {
        x: width * 0.5,
        y: height * 0.5
      }
    })
    this.renderer.render(viewModel.scene, camera)
  }

  @action
  private updateField(width: number, height: number) {
    this.width = width
    this.height = height
  }
}
