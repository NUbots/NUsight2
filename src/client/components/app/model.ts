import { observable } from 'mobx'
import { RobotModel } from '../robot/model';

export class AppModel {
  @observable public robots: RobotModel[]

  public static of() {
    return new AppModel()
  }
}
