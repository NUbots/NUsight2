import { DashboardModel } from './model'
import { action } from 'mobx'

export class DashboardController {
  public static of() {
    return new DashboardController()
  }

  @action
  public toggleFlipped(model: DashboardModel) {
    model.field.flipped = !model.field.flipped
  }
}
