import { storiesOf } from '@storybook/react'
import { computed } from 'mobx'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { useLocalStore } from 'mobx-react'
import { useEffect } from 'react'
import React from 'react'

import { fourcc } from '../../../../image_decoder/fourcc'
import { fullscreen } from '../../../storybook/fullscreen'
import { orthographicCamera } from '../../../three/builders'
import { scene } from '../../../three/builders'
import { stage } from '../../../three/builders'
import { ObjectFit } from '../../../three/three'
import { Canvas } from '../../../three/three'
import { Three } from '../../../three/three'
import { Image } from '../view_model'
import { ImageView } from '../view_model'

import imageUrl from './image.jprg.jpg'
import imageBinUrl from './image.rggb.bin'

storiesOf('components.vision2.image_view', module)
  .addDecorator(fullscreen)
  .add('JPRG', () => {
    const Story = observer(() => {
      const model = useLocalStore(() => ({
        image: undefined as Image | undefined,
        get imageDecoder() {
          return model.image ? ImageView.of(model.image) : undefined
        },
        get objectFit(): ObjectFit {
          return model.image
            ? { type: 'contain', aspect: model.image.height / model.image.width }
            : { type: 'fill' }
        },
      }))
      useEffect(() => {
        loadImage(imageUrl).then(action((image: HTMLImageElement) => {
          model.image = {
            type: 'element',
            width: image.width,
            height: image.height,
            element: image,
            format: fourcc('JPRG'),
          }
        }))
      }, [])
      const { imageDecoder } = model
      if (!imageDecoder) {
        return null
      }
      const stage = (canvas: Canvas) => {
        return computed(() => [ViewModel.of(canvas, imageDecoder).stage])
      }
      return <Three stage={stage} objectFit={model.objectFit}/>
    })
    return <Story/>
  })
  .add('RGGB', () => {
    const Story = observer(() => {
      const model = useLocalStore(() => ({
        image: undefined as Image | undefined,
        get imageDecoder() {
          return model.image ? ImageView.of(model.image) : undefined
        },
        get objectFit(): ObjectFit {
          return model.image
            ? { type: 'contain', aspect: model.image.height / model.image.width }
            : { type: 'fill' }
        },
      }))
      useEffect(() => {
        fetchUrlAsBuffer(imageBinUrl).then(action((data: ArrayBuffer) => {
          model.image = {
            type: 'data',
            width: 1280,
            height: 1024,
            data: new Uint8Array(data),
            format: fourcc('RGGB'),
          }
        }))
      }, [])
      const { imageDecoder } = model
      if (!imageDecoder) {
        return null
      }
      const stage = (canvas: Canvas) => {
        return computed(() => [ViewModel.of(canvas, imageDecoder).stage])
      }
      return <Three stage={stage} objectFit={model.objectFit}/>
    })
    return <Story/>
  })

class ViewModel {
  constructor(
    private readonly canvas: Canvas,
    private readonly decoder: ImageView,
  ) {
  }

  static of(canvas: Canvas, decoder: ImageView) {
    return new ViewModel(canvas, decoder)
  }

  readonly stage = stage(() => ({
    scene: this.scene(),
    camera: this.camera(),
  }))

  readonly scene = scene(() => ({
    children: [
      this.decoder.image(),
    ],
  }))

  readonly camera = orthographicCamera(() => ({ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1 }))
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject()
    image.src = url
  })
}

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
