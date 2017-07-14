import { computed } from 'mobx'
import { createTransformer } from 'mobx'
import { Object3D } from 'three'
import { Quaternion } from 'three'
import { BodyViewModel } from './body/view_model'
import { RobotModel } from './model'

export const HIP_TO_FOOT = 0.2465

export class RobotViewModel {
  public constructor(private model: RobotModel) {
  }

  public static of = createTransformer((model: RobotModel): RobotViewModel => {
    return new RobotViewModel(model)
  })

  @computed
  public get robot(): Object3D {
    const robot = new Object3D()
    robot.position.x = this.model.position.x
    robot.position.y = this.model.position.y + HIP_TO_FOOT
    robot.position.z = this.model.position.z
    const rotation = new Quaternion(this.model.Rtw.x, this.model.Rtw.y, this.model.Rtw.z, this.model.Rtw.w)
    robot.setRotationFromQuaternion(rotation)
    robot.add(BodyViewModel.of(this.model).body)
    return robot
  }
}
