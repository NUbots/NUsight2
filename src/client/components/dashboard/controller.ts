import { action } from 'mobx'
import { DashboardModel } from './model'

export class DashboardController {
  public static of(): DashboardController {
    return new DashboardController()
  }
}
