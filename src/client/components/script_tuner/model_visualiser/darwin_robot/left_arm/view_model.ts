import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { Robot3dViewModel } from '../../model'

import * as LeftLowerArmConfig from './config/left_lower_arm.json'
import * as LeftShoulderConfig from './config/left_shoulder.json'
import * as LeftUpperArmConfig from './config/left_upper_arm.json'

export const createLeftArm = createTransformer((viewModel: Robot3dViewModel) => {
  const leftArm = new Object3D()
  leftArm.add(createLeftShoulder(viewModel))
  return leftArm
})

const createLeftShoulder = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftShoulderConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0.082, 0, 0)
  mesh.rotation.set(viewModel.LEFT_SHOULDER_PITCH - Math.PI / 2, 0, 0)
  mesh.add(createLeftUpperArm(viewModel))
  return mesh
})

const createLeftUpperArm = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftUpperArmConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.016, 0)
  mesh.rotation.set(0, 0, viewModel.LEFT_SHOULDER_ROLL)
  mesh.add(createLeftLowerArm(viewModel))
  return mesh
})

const createLeftLowerArm = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftLowerArmConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.06, 0.016)
  mesh.rotation.set(viewModel.LEFT_ELBOW, 0, 0)
  return mesh
})
