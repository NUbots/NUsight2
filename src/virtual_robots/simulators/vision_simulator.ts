import * as fs from 'fs'
import * as path from 'path'
import { Matrix4 } from 'three'

import { fourcc } from '../../client/image_decoder/fourcc'
import { Imat4 } from '../../shared/proto/messages'
import { message } from '../../shared/proto/messages'
import { toTimestamp } from '../../shared/time/timestamp'
import { Message } from '../simulator'
import { Simulator } from '../simulator'
import CompressedImage = message.output.CompressedImage
import Projection = message.output.CompressedImage.Lens.Projection

export class VisionSimulator implements Simulator {
  constructor(private images: Uint8Array[]) {
  }

  static of(): VisionSimulator {
    const images = Array.from(
      { length: 11 },
      (_, i) => toUint8Array(fs.readFileSync(path.join(__dirname, `images/${i}.jpg`))),
    )
    return new VisionSimulator(images)
  }

  simulate(time: number, index: number, numRobots: number): Message[] {
    const messageType = 'message.output.CompressedImage'
    const period = 5
    const numImages = this.images.length
    const imageIndex = Math.floor((Math.sin(2 * Math.PI * time / period) + 1) / 2 * numImages) % numImages
    const data = this.images[imageIndex]
    const buffer = CompressedImage.encode({
      format: fourcc('JPEG'),
      dimensions: { x: 712, y: 463 },
      data,
      cameraId: 1,
      name: 'Virtual Camera',
      timestamp: toTimestamp(time),
      Hcw: toProtoMat44(new Matrix4()),
      lens: {
        projection: Projection.RECTILINEAR,
        focalLength: 1,
        fov: 1,
      },
    }).finish()
    const message = { messageType, buffer }
    return [message]
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
