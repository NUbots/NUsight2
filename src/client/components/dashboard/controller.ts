import { DashboardModel } from './model'
import { action } from 'mobx'

export class DashboardController {
  public static create() {
    return new DashboardController()
  }

  @action
  public toggleOrientation(model: DashboardModel) {
    model.field.orientation = model.field.orientation === 'left' ? 'right' : 'left'
  }
}
