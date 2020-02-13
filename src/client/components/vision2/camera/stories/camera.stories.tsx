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
import { fullscreen } from '../../../storybook/fullscreen'
import { CameraModel } from '../model'
import { CameraView } from '../view'

import imageUrl from './image.jpg'
import Projection = message.input.Image.Lens.Projection

storiesOf('components.vision2.camera', module)
  .addDecorator(fullscreen)
  .add('Renders', () => {
    const model = CameraModel.of({ id: 0, name: 'Fake Camera' })
    model.greenhorizon = {
      horizon: [new Vector3(0, 1, 0), new Vector3(1, 0, 0)],
      Hcw: Matrix4.of(),
    }
    const Component = () => {
      useEffect(() => {
        loadImage(imageUrl)
          .then(image => {
            const t = 0
            const img = { type: 'element' as const, element: image, format: fourcc('JPEG') }
            const Hcw = Matrix4.fromThree(new THREE.Matrix4().makeRotationZ(Math.PI * 13 / 32)
              .premultiply(new THREE.Matrix4().makeRotationY(-2 * Math.PI * (1.5 / 16)))
              .premultiply(new THREE.Matrix4().makeRotationX(Math.PI / 35))
              .premultiply(new THREE.Matrix4().makeTranslation(1, 2, 0.8)),
            )
            const Hwc = Matrix4.fromThree(new THREE.Matrix4().getInverse(Hcw.toThree()))
            const focalLength = 412.507218876
            model.image = {
              width: 1280,
              height: 1024,
              image: img,
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
                radius: 0.105,
              },
              distance: 1,
              colour: new Vector4(1, 0.5, 0, 1),
            }]
            model.goals = [{
              timestamp: 0,
              Hcw,
              side: 'left',
              post: {
                top: unprojectEquidistant(new Vector2(135, 320), focalLength),
                bottom: unprojectEquidistant(new Vector2(170, 465), focalLength),
                distance: 4,
              },
            }, {
              timestamp: 0,
              Hcw,
              side: 'right',
              post: {
                top: unprojectEquidistant(new Vector2(420, 145), focalLength),
                bottom: unprojectEquidistant(new Vector2(420, 325), focalLength),
                distance: 4.5,
              },
            }]
          })
      }, [imageUrl])
      return <CameraView model={model}/>
    }
    return <Component/>
  })

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject()
    image.src = url
  })
}

function screenToWorldRay(screenPoint: Vector2, focalLength: number, Hwc: Matrix4) {
  const rFCc = unprojectEquidistant(screenPoint, focalLength)
  const Rwc = new THREE.Matrix4().extractRotation(Hwc.toThree())
  return Vector3.fromThree(rFCc.toThree().applyMatrix4(Rwc)) // rFCw
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
