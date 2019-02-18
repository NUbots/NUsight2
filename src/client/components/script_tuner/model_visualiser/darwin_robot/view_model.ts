import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Object3D } from 'three'
import { Quaternion } from 'three'

import { Robot3dViewModel } from '../model'

import { createBody } from './body/view_model'

export const HIP_TO_FOOT = 0.2465

export const createRobot = createTransformer((viewModel: Robot3dViewModel) => {
  const robot = new Object3D()

  robot.position.x = viewModel.rWTt.x
  robot.position.y = viewModel.rWTt.y
  robot.position.z = viewModel.rWTt.z

  const rotation = new Quaternion(viewModel.Rwt.x, viewModel.Rwt.y, viewModel.Rwt.z, viewModel.Rwt.w)
  robot.setRotationFromQuaternion(rotation)

  robot.add(createBody(viewModel))

  return robot
})
