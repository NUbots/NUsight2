import { storiesOf } from '@storybook/react'
import { useEffect } from 'react'
import * as React from 'react'
import * as THREE from 'three'

import { message } from '../../../../../shared/proto/messages'
import { fourcc } from '../../../../image_decoder/fourcc'
import { Matrix4 } from '../../../../math/matrix4'
import { Vector2 } from '../../../../math/vector2'
import { Vector3 } from '../../../../math/vector3'
import { Vector4 } from '../../../../math/vector4'
import { RobotModel } from '../../../robot/model'
import { fullscreen } from '../../../storybook/fullscreen'
import { VisionRobotModel } from '../../model'
import { CameraModel } from '../model'
import { CameraView } from '../view'
import { CameraViewModel } from '../view_model'

import imageUrl from './image.jpg'
import Projection = message.input.Image.Lens.Projection

storiesOf('components.vision.camera', module)
  .addDecorator(fullscreen)
  .add('Renders', () => {
    const robotModel = RobotModel.of({
      id: '1',
      connected: true,
      enabled: true,
      name: 'test',
      address: '127.0.0.1',
      port: 1234,
    })
    const visionRobotModel = VisionRobotModel.of(robotModel)
    const model = CameraModel.of(visionRobotModel, { id: 0, name: 'Fake Camera' })
    model.greenhorizon = {
      horizon: [new Vector3(0, 1, 0), new Vector3(1, 0, 0)],
      Hcw: Matrix4.of(),
    }
    const Component = () => {
      useEffect(() => {
        fetchUrlAsBuffer(imageUrl)
          .then(imageBuffer => {
            const Hcw = Matrix4.fromThree(new THREE.Matrix4().makeRotationZ(Math.PI * 13 / 32)
              .premultiply(new THREE.Matrix4().makeRotationY(-2 * Math.PI * (1.9 / 16)))
              .premultiply(new THREE.Matrix4().makeRotationX(Math.PI / 35))
              .multiply(new THREE.Matrix4().makeTranslation(1, 2, 0)),
            )
            const Hwc = Matrix4.fromThree(new THREE.Matrix4().getInverse(Hcw.toThree()))
            const focalLength = 412.507218876
            model.image = {
              width: 1280,
              height: 1024,
              format: fourcc('JPEG'),
              data: new Uint8Array(imageBuffer),
              Hcw,
              lens: {
                projection: Projection.EQUIDISTANT,
                focalLength: focalLength / 1280,
                centre: Vector2.of(),
              },
            }
            model.greenhorizon = {
              horizon: [
                new Vector2(80, 550),
                new Vector2(530, 290),
                new Vector2(900, 350),
                new Vector2(1150, 500),
                new Vector2(1210, 710),
                new Vector2(950, 1010),
                new Vector2(250, 900),
                new Vector2(80, 550),
              ].map(p => screenToWorldRay(p, focalLength, Hwc)),
              Hcw,
            }
            model.balls = [{
              timestamp: 0,
              Hcw,
              cone: {
                axis: unprojectEquidistant(new Vector2(417, 647), focalLength),
                radius: 0.9943,
              },
              colour: new Vector4(1, 0.5, 0, 1),
            }]
          })
      }, [imageUrl])
      const viewModel = CameraViewModel.of(model)
      return <CameraView viewModel={viewModel}/>
    }
    return <Component/>
  })

async function fetchUrlAsBuffer(imageUrl: string): Promise<ArrayBuffer> {
  return fetch(imageUrl)
    .then(res => res.blob())
    .then(blob => {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          const data = reader.result
          if (data && data instanceof ArrayBuffer) {
            resolve(data)
          } else {
            reject(reader.error)
          }
        })
        reader.readAsArrayBuffer(blob)
      })
    })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject()
    image.src = url
  })
}

function screenToWorldRay(screenPoint: Vector2, focalLength: number, Hwc: Matrix4) {
  const camRay = unprojectEquidistant(screenPoint, focalLength)
  return Vector3.fromThree(camRay.toThree().applyMatrix4(new THREE.Matrix4().extractRotation(Hwc.toThree())))
}

function unprojectEquidistant(point: Vector2, focalLength: number, centre?: Vector2): Vector3 {
  const offset = new Vector2(1280 / 2, 1024 / 2).subtract(point.add(centre || Vector2.of()))
  const r = offset.length
  const theta = r / focalLength
  return new Vector3(
    Math.cos(theta),
    r !== 0 ? Math.sin(theta) * offset.x / r : 0,
    r !== 0 ? Math.sin(theta) * offset.y / r : 0,
  ).normalize()
}
