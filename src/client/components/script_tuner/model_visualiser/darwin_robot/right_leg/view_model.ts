import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { Robot3dViewModel } from '../../model'

import * as RightAnkleConfig from './config/right_ankle.json'
import * as RightFootConfig from './config/right_foot.json'
import * as RightLowerLegConfig from './config/right_lower_leg.json'
import * as RightPelvisConfig from './config/right_pelvis.json'
import * as RightPelvisYConfig from './config/right_pelvis_y.json'
import * as RightUpperLegConfig from './config/right_upper_leg.json'

export const createRightLeg = createTransformer((viewModel: Robot3dViewModel) => {
  const rightLeg = new Object3D()
  rightLeg.add(createRightPelvisY(viewModel))
  return rightLeg
})

const createRightPelvisY = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightPelvisYConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(-0.037, -0.1222, -0.005)
  mesh.rotation.set(0, viewModel.RIGHT_HIP_YAW, 0)
  mesh.add(createRightPelvis(viewModel))
  return mesh
})

const createRightPelvis = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightPelvisConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.rotation.set(0, 0, viewModel.RIGHT_HIP_ROLL)
  mesh.add(createRightUpperLeg(viewModel))
  return mesh
})

const createRightUpperLeg = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightUpperLegConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.rotation.set(viewModel.RIGHT_HIP_PITCH, 0, 0)
  mesh.add(createRightLowerLeg(viewModel))
  return mesh
})

const createRightLowerLeg = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightLowerLegConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.093, 0)
  mesh.rotation.set(viewModel.RIGHT_KNEE, 0, 0)
  mesh.add(createRightAnkle(viewModel))
  return mesh
})

const createRightAnkle = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightAnkleConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.093, 0)
  mesh.rotation.set(viewModel.RIGHT_ANKLE_PITCH, 0, 0)
  mesh.add(createRightFoot(viewModel))
  return mesh
})

const createRightFoot = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(RightFootConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.rotation.set(0, 0, viewModel.RIGHT_ANKLE_ROLL)
  return mesh
})
