import { createTransformer } from 'mobx-utils'
import { Mesh } from 'three'
import { Object3D } from 'three'

import { geometryAndMaterial } from '../../../utils'
import { Robot3dViewModel } from '../../model'

import * as CameraConfig from './config/camera.json'
import * as EyeLEDConfig from './config/eye_led.json'
import * as HeadConfig from './config/head.json'
import * as HeadLEDConfig from './config/head_led.json'
import * as NeckConfig from './config/neck.json'

export const createHead = createTransformer((viewModel: Robot3dViewModel) => {
  const head = new Object3D()
  head.add(createNeck(viewModel))
  return head
})

const createNeck = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(NeckConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)

  mesh.position.set(0, 0.051, 0)
  mesh.rotation.set(0, viewModel.headPan, 0)
  mesh.add(createSkull(viewModel))

  return mesh
})

const createSkull = createTransformer((viewModel: Robot3dViewModel) => {
  const { geometry, materials } = geometryAndMaterial(HeadConfig, viewModel.color)
  const mesh = new Mesh(geometry, materials)

  mesh.rotation.set(viewModel.headTilt, 0, 0)
  mesh.add(createHeadLED(viewModel.color))
  mesh.add(createEyeLED(viewModel.color))
  mesh.add(createCamera(viewModel.color))

  return mesh
})

const createHeadLED = createTransformer((color?: string) => {
  const { geometry, materials } = geometryAndMaterial(HeadLEDConfig, color)
  return new Mesh(geometry, materials)
})

const createEyeLED = createTransformer((color?: string) => {
  const { geometry, materials } = geometryAndMaterial(EyeLEDConfig, color)
  return new Mesh(geometry, materials)
})

const createCamera = createTransformer((color?: string) => {
  const { geometry, materials } = geometryAndMaterial(CameraConfig, color)
  return new Mesh(geometry, materials)
})
