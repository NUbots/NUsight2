import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { Robot3dViewModel } from '../../model'

import * as LeftAnkleConfig from './config/left_ankle.json'
import * as LeftFootConfig from './config/left_foot.json'
import * as LeftLowerLegConfig from './config/left_lower_leg.json'
import * as LeftPelvisConfig from './config/left_pelvis.json'
import * as LeftPelvisYConfig from './config/left_pelvis_y.json'
import * as LeftUpperLegConfig from './config/left_upper_leg.json'

export const createLeftLeg = createTransformer((viewModel: Robot3dViewModel) => {
  const leftLeg = new Object3D()
  leftLeg.add(createLeftPelvisY(viewModel))
  return leftLeg
})

const createLeftPelvisY = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftPelvisYConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0.037, -0.1222, -0.005)
  mesh.rotation.set(0, viewModel.LEFT_HIP_YAW, 0)
  mesh.add(createLeftPelvis(viewModel))
  return mesh
})

const createLeftPelvis = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftPelvisConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.rotation.set(0, 0, viewModel.LEFT_HIP_ROLL)
  mesh.add(createLeftUpperLeg(viewModel))
  return mesh
})

const createLeftUpperLeg = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftUpperLegConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.rotation.set(viewModel.LEFT_HIP_PITCH, 0, 0)
  mesh.add(createLeftLowerLeg(viewModel))
  return mesh
})

const createLeftLowerLeg = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftLowerLegConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.093, 0)
  mesh.rotation.set(viewModel.LEFT_KNEE, 0, 0)
  mesh.add(createLeftAnkle(viewModel))
  return mesh
})

const createLeftAnkle = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftAnkleConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.position.set(0, -0.093, 0)
  mesh.rotation.set(viewModel.LEFT_ANKLE_PITCH, 0, 0)
  mesh.add(createLeftFoot(viewModel))
  return mesh
})

const createLeftFoot = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(LeftFootConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)
  mesh.rotation.set(0, 0, viewModel.LEFT_ANKLE_ROLL)
  return mesh
})
