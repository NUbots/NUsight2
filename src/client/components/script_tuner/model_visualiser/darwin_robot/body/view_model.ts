import { computed } from 'mobx'
import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { Robot3dViewModel } from '../../model'
import { createHead } from '../head/view_model'
import { createLeftArm } from '../left_arm/view_model'
import { createLeftLeg } from '../left_leg/view_model'
import { createRightArm } from '../right_arm/view_model'
import { createRightLeg } from '../right_leg/view_model'

import * as BodyConfig from './config/body.json'

export const createBody = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(BodyConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)

  mesh.add(createHead(viewModel))
  mesh.add(createLeftArm(viewModel))
  mesh.add(createRightArm(viewModel))
  mesh.add(createLeftLeg(viewModel))
  mesh.add(createRightLeg(viewModel))

  mesh.position.set(0, 0, 0.096)
  mesh.rotation.x = Math.PI / 2
  mesh.rotation.y = Math.PI / 2

  return mesh
})
