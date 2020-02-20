import { storiesOf } from '@storybook/react'
import { observable } from 'mobx'
import { Observer } from 'mobx-react'
import * as React from 'react'
import * as THREE from 'three'

import { Matrix4 } from '../../../../math/matrix4'
import { Vector2 } from '../../../../math/vector2'
import { Vector3 } from '../../../../math/vector3'
import { Vector4 } from '../../../../math/vector4'
import { fullscreen } from '../../../storybook/fullscreen'
import { ImageFormat } from '../../image'
import { Image } from '../../image'
import imageUrl from '../../image_view/stories/images/image.jpg'
import { GreenHorizon } from '../model'
import { CameraParams } from '../model'
import { Projection } from '../model'
import { CameraModel } from '../model'
import { CameraView } from '../view'

storiesOf('components.vision2.camera', module)
  .addDecorator(fullscreen)
  .add('vision objects', () => {
    const box = observable<{ model: CameraModel | undefined }>({ model: undefined })
    fakeCameraModel().then(model => box.model = model)
    return <Observer>{() => <>
      {box.model ? <CameraView model={box.model}/> : null}
    </>}</Observer>
  })

async function fakeCameraModel(): Promise<CameraModel> {
  const image = await loadImageElement(imageUrl, ImageFormat.JPEG)
  const Hcw = Matrix4.fromThree(new THREE.Matrix4().makeRotationZ(Math.PI * 13 / 32)
    .premultiply(new THREE.Matrix4().makeRotationY(-2 * Math.PI * (1.5 / 16)))
    .premultiply(new THREE.Matrix4().makeRotationX(Math.PI / 35))
    .premultiply(new THREE.Matrix4().makeTranslation(1, 2, 0.8)),
  )
  const Hwc = Matrix4.fromThree(new THREE.Matrix4().getInverse(Hcw.toThree()))
  const focalLength = 412.507218876
  return CameraModel.of({
    id: 0,
    name: 'Fake Camera',
    image,
    params: new CameraParams({
      Hcw,
      lens: {
        projection: Projection.EQUIDISTANT,
        focalLength: focalLength / 1280,
      },
    }),
    greenhorizon: new GreenHorizon({
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
    }),
    balls: [{
      timestamp: 0,
      Hcw,
      cone: {
        axis: unprojectEquidistant(new Vector2(417, 647), focalLength),
        radius: 0.105,
      },
      distance: 1,
      colour: new Vector4(1, 0.5, 0, 1),
    }],
    goals: [{
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
    }],
  })
}

async function loadImageElement(url: string, format: ImageFormat): Promise<Image> {
  const element = await loadImage(url)
  const { width, height } = element
  return { type: 'element', width, height, element, format }
}

async function loadImage(url: string): Promise<HTMLImageElement> {
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

function unprojectEquidistant(point: Vector2, focalLength: number): Vector3 {
  const offset = new Vector2(1280 / 2, 1024 / 2).subtract(point) // TODO
  const r = offset.length
  const theta = r / focalLength
  return new Vector3(
    Math.cos(theta),
    r !== 0 ? Math.sin(theta) * offset.x / r : 0,
    r !== 0 ? Math.sin(theta) * offset.y / r : 0,
  ).normalize()
}
