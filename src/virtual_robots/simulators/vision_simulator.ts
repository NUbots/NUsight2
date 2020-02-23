import fs from 'fs'
import { autorun } from 'mobx'
import { Vector3 } from 'three'
import { Matrix4 } from 'three'

import { fourcc } from '../../client/image_decoder/fourcc'
import { NUClearNetClient } from '../../shared/nuclearnet/nuclearnet_client'
import { Imat4 } from '../../shared/proto/messages'
import { message } from '../../shared/proto/messages'
import { toTimestamp } from '../../shared/time/timestamp'
import { Simulator } from '../simulator'
import { Message } from '../simulator'

import image0 from './images/0.jpg'
import image1 from './images/1.jpg'
import image10 from './images/10.jpg'
import image2 from './images/2.jpg'
import image3 from './images/3.jpg'
import image4 from './images/4.jpg'
import image5 from './images/5.jpg'
import image6 from './images/6.jpg'
import image7 from './images/7.jpg'
import image8 from './images/8.jpg'
import image9 from './images/9.jpg'
import { periodic } from './periodic'
import CompressedImage = message.output.CompressedImage
import Projection = message.output.CompressedImage.Lens.Projection
import Balls = message.vision.Balls
import Side = message.vision.Goal.Side
import Goals = message.vision.Goals

export class VisionSimulator extends Simulator {
  constructor(nuclearnetClient: NUClearNetClient, private readonly images: Uint8Array[]) {
    super(nuclearnetClient)
  }

  start() {
    const stops = [
      autorun(() => this.send(this.image)),
      autorun(() => this.send(this.goals)),
      autorun(() => this.send(this.balls)),
    ]
    return () => stops.forEach(stop => stop())
  }

  static of({ nuclearnetClient }: { nuclearnetClient: NUClearNetClient }): VisionSimulator {
    const urls = [
      image0,
      image1,
      image2,
      image3,
      image4,
      image5,
      image6,
      image7,
      image8,
      image9,
      image10,
    ]
    const images = urls.map(url => toUint8Array(fs.readFileSync(url)))
    return new VisionSimulator(nuclearnetClient, images)
  }

  private get image(): Message {
    const time = periodic(10)
    const t = time / 10
    const numImages = this.images.length
    const imageIndex = Math.floor(((Math.cos(2 * Math.PI * t) + 1) / 2) * numImages) % numImages
    const data = this.images[imageIndex]
    const Hcw = new Matrix4().makeRotationZ(2 * Math.PI * t)
    return {
      messageType: 'message.output.CompressedImage',
      buffer: CompressedImage.encode({
        format: fourcc('JPEG'),
        dimensions: { x: 712, y: 463 },
        data,
        cameraId: 1,
        name: 'Virtual Camera',
        timestamp: toTimestamp(time),
        Hcw: toProtoMat44(Hcw),
        lens: {
          projection: Projection.RECTILINEAR,
          focalLength: 1,
          fov: 1,
        },
      }).finish(),
    }
  }

  private get balls(): Message {
    const time = periodic(10)
    const t = time / 10
    const Hcw = new Matrix4().makeRotationZ(2 * Math.PI * t)
    const axis = new Vector3(10, 1, 0)
      .normalize()
      .applyMatrix4(new Matrix4().makeRotationX(2 * Math.PI * t))
    return {
      messageType: 'message.vision.Balls',
      buffer: Balls.encode({
        cameraId: 1,
        timestamp: toTimestamp(time),
        Hcw: toProtoMat44(Hcw),
        balls: [
          {
            cone: {
              axis,
              gradient: Math.cos((Math.PI / 16) * (Math.cos(2 * Math.PI * t) / 5 + 1)),
            },
            measurements: [],
          },
        ],
      }).finish(),
    }
  }

  private get goals(): Message {
    const time = periodic(10)
    const t = time / 10
    const Hcw = new Matrix4().makeRotationZ(2 * Math.PI * t)
    return {
      messageType: 'message.vision.Goals',
      buffer: Goals.encode({
        cameraId: 1,
        timestamp: toTimestamp(time),
        Hcw: toProtoMat44(Hcw),
        goals: [
          {
            side: Side.RIGHT,
            post: {
              top: new Vector3(10, -2, 2).normalize(),
              bottom: new Vector3(10, -2, -2).normalize(),
            },
            measurements: [],
          },
          {
            side: Side.LEFT,
            post: {
              top: new Vector3(10, 2, 2).normalize(),
              bottom: new Vector3(10, 2, -2).normalize(),
            },
            measurements: [],
          },
          {
            side: Side.UNKNOWN_SIDE,
            post: {
              top: new Vector3(10, 0, 2).normalize(),
              bottom: new Vector3(10, 0, -2).normalize(),
            },
            measurements: [],
          },
        ],
      }).finish(),
    }
  }
}

function toUint8Array(b: Buffer): Uint8Array {
  return new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT)
}

function toProtoMat44(m: Matrix4): Imat4 {
  return {
    x: { x: m.elements[0], y: m.elements[1], z: m.elements[2], t: m.elements[3] },
    y: { x: m.elements[4], y: m.elements[5], z: m.elements[6], t: m.elements[7] },
    z: { x: m.elements[8], y: m.elements[9], z: m.elements[10], t: m.elements[11] },
    t: { x: m.elements[12], y: m.elements[13], z: m.elements[14], t: m.elements[15] },
  }
}
