import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { Robot3dViewModel } from '../../model'

import * as RightLowerArmConfig from './config/right_lower_arm.json'
import * as RightShoulderConfig from './config/right_shoulder.json'
import * as RightUpperArmConfig from './config/right_upper_arm.json'

export const createRightArm = createTransformer((viewModel: Robot3dViewModel) => {
  const rightArm = new Object3D()
  rightArm.add(createRightShoulder(viewModel))
  return rightArm
})

const createRightShoulder = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightShoulderConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(-0.082, 0, 0)
  mesh.rotation.set(viewModel.RIGHT_SHOULDER_PITCH - Math.PI / 2, 0, 0)
  mesh.add(createRightUpperArm(viewModel))
  return mesh
})

const createRightUpperArm = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightUpperArmConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.016, 0)
  mesh.rotation.set(0, 0, viewModel.RIGHT_SHOULDER_ROLL)
  mesh.add(createRightLowerArm(viewModel))
  return mesh
})

const createRightLowerArm = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightLowerArmConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.06, 0.016)
  mesh.rotation.set(viewModel.RIGHT_ELBOW, 0, 0)
  return mesh
})
