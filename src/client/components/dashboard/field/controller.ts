import { action } from 'mobx'
import { FieldModel } from './model'

export class FieldController {
  public static of(): FieldController {
    return new FieldController()
  }

  @action
  public onFieldResize(model: FieldModel, width: number, height: number) {
    const fieldWidth = model.fieldWidth
    const fieldLength = model.fieldLength
    const scaleX = width / fieldLength
    const scaleY = height / fieldWidth

    const canvasAspect = height / width
    const fieldAspect = fieldWidth / fieldLength
    const scale = canvasAspect < fieldAspect ? scaleY : scaleX

    model.camera.scale.x = scale
    model.camera.scale.y = -scale

    // Translate by half of the canvas width and height so that the field appears in the center.
    model.camera.translate.x = width * 0.5
    model.camera.translate.y = height * 0.5
  }
}
